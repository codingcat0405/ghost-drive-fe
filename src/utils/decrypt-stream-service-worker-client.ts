/**
 * Page-side client for public/decrypt-stream-sw.js.
 *
 * - ensureDecryptStreamServiceWorker(): registers the SW and waits until it controls this page
 * - registerDecryptStream(): returns a same-origin URL that streams + decrypts a file on the fly
 *   (usable as <video src>, or `downloadUrl` to save to disk without a big in-memory Blob)
 * - clearAllDecryptStreams(): wipe every session/key from page + SW memory (logout / PIN lock)
 *
 * The page keeps the session registry (source of truth) and answers the SW when it asks for a
 * session it lost because the browser terminated the idle worker, or for a fresh presigned URL.
 */

import ghostDriveApi from '@/apis/ghost-drive-api';

const SERVICE_WORKER_URL = '/decrypt-stream-sw.js';
const STREAM_PATH_PREFIX = '/__ghost-stream/';
const CONTROLLER_WAIT_MS = 3000;
const KEEP_ALIVE_INTERVAL_MS = 20_000; // < Chrome's 30s SW idle timeout
const DOWNLOAD_SESSION_TTL_MS = 6 * 60 * 60 * 1000; // safety net if the SW never reports back

export interface DecryptStreamSessionConfig {
  objectKey: string; // to refresh an expired presigned URL
  downloadUrl: string; // presigned MinIO GET URL of the encrypted object
  aesKey: string; // base64 plain AES key — memory only
  size: number; // ORIGINAL plaintext size
  mimeType: string;
  fileName: string;
}

interface RegistryEntry {
  config: DecryptStreamSessionConfig;
  isDownload: boolean;
  createdAt: number;
  onError?: (message: string) => void;
}

const sessionRegistry = new Map<string, RegistryEntry>();
let keepAliveTimer: ReturnType<typeof setInterval> | undefined;

const isServiceWorkerSupported = () => 'serviceWorker' in navigator && window.isSecureContext;
const postToServiceWorker = (message: unknown) => navigator.serviceWorker?.controller?.postMessage(message);

const forgetSession = (id: string) => {
  sessionRegistry.delete(id);
  postToServiceWorker({ type: 'unregister-stream', id });
  updateKeepAlive();
};

/** Ping the SW while downloads run so Chrome does not terminate it mid-stream */
function updateKeepAlive() {
  const now = Date.now();
  sessionRegistry.forEach((entry, id) => {
    if (entry.isDownload && now - entry.createdAt > DOWNLOAD_SESSION_TTL_MS) forgetSession(id);
  });
  const hasActiveDownload = [...sessionRegistry.values()].some((entry) => entry.isDownload);
  if (hasActiveDownload && !keepAliveTimer) {
    keepAliveTimer = setInterval(() => {
      postToServiceWorker({ type: 'keep-alive' });
      updateKeepAlive();
    }, KEEP_ALIVE_INTERVAL_MS);
  } else if (!hasActiveDownload && keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = undefined;
  }
}

const handleServiceWorkerMessage = async (event: MessageEvent) => {
  const { type, id, message } = event.data ?? {};
  const entry = id ? sessionRegistry.get(id) : undefined;
  const reply = (data: unknown) => event.ports[0]?.postMessage(data);

  switch (type) {
    case 'request-stream-session':
      reply(entry?.config ?? null);
      break;
    case 'refresh-download-url':
      if (!entry) return reply(null);
      try {
        const { downloadUrl } = await ghostDriveApi.upload.getDownloadUrl(entry.config.objectKey);
        entry.config = { ...entry.config, downloadUrl };
        reply({ downloadUrl });
      } catch {
        reply(null);
      }
      break;
    case 'stream-finished':
      if (entry?.isDownload) forgetSession(id);
      break;
    case 'stream-error':
      entry?.onError?.(message);
      if (entry?.isDownload) forgetSession(id);
      break;
  }
};

if (isServiceWorkerSupported()) {
  navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  navigator.serviceWorker.startMessages();
}

const waitForController = (timeoutMs: number) =>
  new Promise<void>((resolve) => {
    if (navigator.serviceWorker.controller) return resolve();
    const timer = setTimeout(resolve, timeoutMs);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });

let readyPromise: Promise<boolean> | null = null;

/** Resolves true when streaming decryption is available (SW active and controlling the page) */
export const ensureDecryptStreamServiceWorker = async (): Promise<boolean> => {
  readyPromise ??= (async () => {
    if (!isServiceWorkerSupported()) return false;
    try {
      const existing = await navigator.serviceWorker.getRegistration('/');
      // Hard reload (Shift+F5) bypasses an already-active SW → controller stays null for this
      // page's lifetime → cache `false` (no 3s wait each time) and use the Blob fallback.
      const bypassedByHardReload = !!existing?.active && !navigator.serviceWorker.controller;
      await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' });
      if (bypassedByHardReload) return false;
      await navigator.serviceWorker.ready;
      // First visit: SW calls clients.claim() on activate → wait for it to take control
      await waitForController(CONTROLLER_WAIT_MS);
      return !!navigator.serviceWorker.controller;
    } catch (error) {
      console.warn('Decrypt stream service worker unavailable:', error);
      readyPromise = null; // registration error (e.g. offline) → allow retry later
      return false;
    }
  })();
  return readyPromise;
};

export interface DecryptStreamHandle {
  /** Streams plaintext (HTTP Range supported) → <video>/<audio> src, or download URL */
  url: string;
  /** Forget the session (removes the key from page + SW memory) */
  release: () => void;
}

/**
 * @param options.download - serve as attachment; one-shot session auto-released when it ends
 * @param options.onError - called if the SW reports a stream failure (e.g. download failed)
 */
export const registerDecryptStream = (
  config: DecryptStreamSessionConfig,
  options: { download?: boolean; onError?: (message: string) => void } = {}
): DecryptStreamHandle => {
  const id = crypto.randomUUID();
  const isDownload = !!options.download;
  sessionRegistry.set(id, { config, isDownload, createdAt: Date.now(), onError: options.onError });
  postToServiceWorker({ type: 'register-stream', id, session: config });
  updateKeepAlive();

  const url = `${STREAM_PATH_PREFIX}${id}/${encodeURIComponent(config.fileName)}`;
  return {
    url: isDownload ? `${url}?download=1` : url,
    release: () => forgetSession(id),
  };
};

/** Wipe all stream sessions (and their AES keys) from page + SW memory */
export const clearAllDecryptStreams = () => {
  sessionRegistry.clear();
  postToServiceWorker({ type: 'clear-all' });
  updateKeepAlive();
};

/**
 * Start a streamed download. A hidden iframe navigation is the most reliable way to make the
 * browser hand a service-worker response (Content-Disposition: attachment) to its download manager.
 */
export const triggerStreamDownload = (downloadUrl: string) => {
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.src = downloadUrl;
  document.body.appendChild(iframe);
  // The download manager owns the transfer once started; remove the iframe later
  setTimeout(() => iframe.remove(), 60_000);
};
