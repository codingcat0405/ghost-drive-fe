/* eslint-disable no-restricted-globals */
/**
 * Ghost Drive decrypt-stream Service Worker.
 *
 * Serves virtual URLs `/__ghost-stream/<sessionId>/<fileName>[?download=1]` by fetching only the
 * needed encrypted chunks from MinIO (HTTP Range), decrypting them with AES-GCM and streaming the
 * plaintext back. Supports Range requests (206) so <video>/<audio> can start fast and seek, and
 * `?download=1` streams a file to disk without building a giant Blob in memory.
 *
 * Plain JS on purpose: it must be served from the site root (scope "/") and is not bundled by Vite.
 * Layout constants MUST mirror src/utils/encrypted-chunk-layout.ts.
 *
 * Security: the AES key only lives in this worker's memory (never persisted). If the browser
 * terminates the worker, sessions are re-requested from the open page via MessageChannel.
 * Download sessions are one-shot (dropped when the download ends); `clear-all` wipes everything.
 *
 * Page ⇄ SW messages:
 *   page → SW: register-stream, unregister-stream, clear-all, keep-alive
 *   SW → page: request-stream-session / refresh-download-url (MessageChannel reply),
 *              stream-finished { id }, stream-error { id, message }
 */

const CHUNK_SIZE = 25 * 1024 * 1024;
const IV_SIZE = 12;
const TAG_SIZE = 16;
const ENCRYPTION_OVERHEAD = IV_SIZE + TAG_SIZE;
const STREAM_PATH_PREFIX = '/__ghost-stream/';
// Unreferenced decrypted chunks kept for reuse (seek back / MP4 moov probing). Chunks still
// referenced by an active stream are never evicted, so memory ≈ (active streams × 2 + 2) chunks.
const DECRYPTED_CHUNK_CACHE_SIZE = 2;
const CLIENT_REPLY_TIMEOUT_MS = 2000;
const MAX_FETCH_ATTEMPTS = 4;

/** sessionId -> session (see createSession) */
const sessions = new Map();
/** sessionId -> Promise<session|null> while recovering a session from pages (dedupe) */
const pendingSessionLookups = new Map();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const createSession = (id, config) => ({
  id,
  config,
  keyPromise: crypto.subtle.importKey('raw', base64ToBytes(config.aesKey), { name: 'AES-GCM' }, false, ['decrypt']),
  /** chunkIndex -> { promise, controller, refs, done } ; Map order = LRU order */
  chunks: new Map(),
});

const dropSession = (id) => {
  const session = sessions.get(id);
  if (!session) return;
  session.chunks.forEach((entry) => entry.controller.abort());
  sessions.delete(id);
};

self.addEventListener('message', (event) => {
  const { type, id, session } = event.data || {};
  if (type === 'register-stream' && id && session) sessions.set(id, createSession(id, session));
  if (type === 'unregister-stream' && id) dropSession(id);
  if (type === 'clear-all') [...sessions.keys()].forEach(dropSession);
  // 'keep-alive': receiving any message resets the idle-termination timer during long downloads
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(STREAM_PATH_PREFIX)) return;
  // No waitUntil on the body stream on purpose: Chrome kills events lasting > 5 minutes.
  // Long downloads are kept alive by page keep-alive pings instead.
  event.respondWith(
    handleStreamRequest(event.request, url).catch((error) => {
      console.error('[decrypt-stream-sw]', error);
      return new Response(errorMessage(error), { status: 500 });
    })
  );
});

// ============= HELPERS =============

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const errorMessage = (error) => String((error && error.message) || error);

async function broadcastToPages(message) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  windows.forEach((client) => client.postMessage(message));
}

/** Ask every open page in parallel; resolves with the first non-null reply (or null) */
async function askPages(message) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const ask = (client) =>
    new Promise((resolve) => {
      const channel = new MessageChannel();
      const finish = (value) => {
        clearTimeout(timer);
        channel.port1.close(); // don't leak open ports
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), CLIENT_REPLY_TIMEOUT_MS);
      channel.port1.onmessage = (event) => finish(event.data || null);
      client.postMessage(message, [channel.port2]);
    });
  return new Promise((resolve) => {
    let remaining = windows.length;
    if (!remaining) return resolve(null);
    windows.forEach((client) =>
      ask(client).then((value) => {
        if (value) resolve(value);
        else if (--remaining === 0) resolve(null);
      })
    );
  });
}

/** Session from memory, or recovered from a page if this worker was restarted */
function getSession(id) {
  if (sessions.has(id)) return Promise.resolve(sessions.get(id));
  if (!pendingSessionLookups.has(id)) {
    const lookup = askPages({ type: 'request-stream-session', id })
      .then((config) => {
        if (!config) return null;
        const session = createSession(id, config);
        sessions.set(id, session);
        return session;
      })
      .finally(() => pendingSessionLookups.delete(id));
    pendingSessionLookups.set(id, lookup);
  }
  return pendingSessionLookups.get(id);
}

/** Fetch + decrypt one chunk with retries (mobile networks drop requests) */
async function fetchAndDecryptChunk(session, chunkIndex, signal) {
  const { size } = session.config;
  const plainLength = Math.min(CHUNK_SIZE, size - chunkIndex * CHUNK_SIZE);
  const encryptedStart = chunkIndex * (CHUNK_SIZE + ENCRYPTION_OVERHEAD);
  const encryptedLength = plainLength + ENCRYPTION_OVERHEAD;
  let refreshedUrl = false;

  for (let attempt = 1; ; attempt++) {
    let retryable = true;
    try {
      const response = await fetch(session.config.downloadUrl, {
        headers: { Range: `bytes=${encryptedStart}-${encryptedStart + encryptedLength - 1}` },
        signal,
      });
      if (response.status === 403 && !refreshedUrl) {
        // Presigned URL probably expired → ask the page for a fresh one, then retry immediately
        refreshedUrl = true;
        const fresh = await askPages({ type: 'refresh-download-url', id: session.id });
        if (fresh && fresh.downloadUrl) {
          session.config = { ...session.config, downloadUrl: fresh.downloadUrl };
          attempt--;
          continue;
        }
      }
      if (!response.ok) {
        retryable = response.status >= 500 || response.status === 429;
        throw new Error(`Chunk ${chunkIndex} download failed: ${response.status}`);
      }
      const encrypted = await response.arrayBuffer();
      if (encrypted.byteLength !== encryptedLength) {
        throw new Error(`Chunk ${chunkIndex} size mismatch: ${encrypted.byteLength} != ${encryptedLength}`);
      }
      retryable = false; // decrypt failure = wrong key / tampered data, never fixed by retrying
      return await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encrypted, 0, IV_SIZE) },
        await session.keyPromise,
        new Uint8Array(encrypted, IV_SIZE)
      );
    } catch (error) {
      if (signal.aborted || !retryable || attempt >= MAX_FETCH_ATTEMPTS) throw error;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

/**
 * Ref-counted LRU of decrypted chunks. Media elements re-request overlapping ranges
 * (start → end for MP4 `moov` → back to start), so reuse avoids re-downloading 25MB, and
 * concurrent requests for the same chunk share one fetch. Unreferenced in-flight loads are
 * aborted (e.g. user scrubbed away) so seeking cannot pile up fetches.
 */
function acquireChunk(session, chunkIndex) {
  const chunks = session.chunks;
  let entry = chunks.get(chunkIndex);
  if (entry) {
    chunks.delete(chunkIndex); // re-insert = most recently used
  } else {
    const controller = new AbortController();
    entry = { controller, refs: 0, done: false };
    entry.promise = fetchAndDecryptChunk(session, chunkIndex, controller.signal);
    entry.promise.then(
      () => (entry.done = true),
      () => chunks.get(chunkIndex) === entry && chunks.delete(chunkIndex)
    );
  }
  entry.refs++;
  chunks.set(chunkIndex, entry);
  return entry;
}

function releaseChunk(session, chunkIndex, entry) {
  entry.refs--;
  if (entry.refs > 0) return;
  if (!entry.done) {
    // Nobody waits for it anymore → stop the download/decrypt
    entry.controller.abort();
    if (session.chunks.get(chunkIndex) === entry) session.chunks.delete(chunkIndex);
    return;
  }
  // Evict least recently used unreferenced chunks beyond the cache size
  const idle = [...session.chunks].filter(([, e]) => e.refs === 0);
  for (let i = 0; i < idle.length - DECRYPTED_CHUNK_CACHE_SIZE; i++) session.chunks.delete(idle[i][0]);
}

/** Parse a single `bytes=` range. Returns null when absent/unsupported (→ full response). */
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec((header || '').trim());
  if (!match || (match[1] === '' && match[2] === '')) return null;
  if (match[1] === '') {
    // Suffix range: last N bytes
    const length = Math.min(Number(match[2]), size);
    return { start: size - length, end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  return { start, end };
}

/**
 * Lazy pull-based stream: a chunk is only fetched when the consumer reads (plus 1 prefetch),
 * and cancel() (seek / closed player) releases everything still held.
 */
function createPlaintextStream(session, start, end, hooks) {
  let chunkIndex = Math.floor(start / CHUNK_SIZE);
  const lastChunkIndex = Math.floor(end / CHUNK_SIZE);
  const held = new Map(); // chunkIndex -> entry acquired by this stream

  const hold = (index) => {
    if (!held.has(index)) held.set(index, acquireChunk(session, index));
    return held.get(index);
  };
  const releaseAll = () => {
    held.forEach((entry, index) => releaseChunk(session, index, entry));
    held.clear();
  };

  return new ReadableStream(
    {
      async pull(controller) {
        try {
          if (chunkIndex > lastChunkIndex) {
            controller.close();
            hooks.onDone();
            return;
          }
          const entry = hold(chunkIndex);
          if (chunkIndex + 1 <= lastChunkIndex) hold(chunkIndex + 1); // prefetch next chunk

          const plain = new Uint8Array(await entry.promise);
          const chunkStart = chunkIndex * CHUNK_SIZE;
          const from = Math.max(start - chunkStart, 0);
          const to = Math.min(end - chunkStart + 1, plain.byteLength);
          // Copy (not a view): the cached buffer must stay intact if the consumer detaches it
          controller.enqueue(plain.slice(from, to));
          held.delete(chunkIndex);
          releaseChunk(session, chunkIndex, entry);
          chunkIndex++;
        } catch (error) {
          releaseAll();
          hooks.onError(error);
          throw error;
        }
      },
      cancel() {
        releaseAll();
        hooks.onCancel();
      },
    },
    { highWaterMark: 0 }
  );
}

async function handleStreamRequest(request, url) {
  const sessionId = url.pathname.slice(STREAM_PATH_PREFIX.length).split('/')[0];
  const isDownload = url.searchParams.get('download') === '1';
  const session = await getSession(sessionId);
  if (!session) {
    if (isDownload) broadcastToPages({ type: 'stream-error', id: sessionId, message: 'Download session expired' });
    return new Response('Stream session not found', { status: 404 });
  }

  const { size, mimeType, fileName } = session.config;
  const headers = new Headers({
    'Content-Type': mimeType || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
  });
  if (isDownload) {
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName || 'download')}`);
  }

  const range = parseRange(request.headers.get('Range'), size);
  if (size > 0 && range && (range.start >= size || range.start > range.end)) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const start = range ? range.start : 0;
  const end = range ? range.end : size - 1;
  const status = range && size > 0 ? 206 : 200;
  headers.set('Content-Length', String(size > 0 ? end - start + 1 : 0));
  if (status === 206) headers.set('Content-Range', `bytes ${start}-${end}/${size}`);

  // Download sessions are one-shot: forget the key once the download ends either way
  const finishDownload = (message) => {
    if (!isDownload) return;
    dropSession(sessionId);
    broadcastToPages(message ? { type: 'stream-error', id: sessionId, message } : { type: 'stream-finished', id: sessionId });
  };

  if (request.method === 'HEAD' || size === 0) {
    if (size === 0) finishDownload();
    return new Response(null, { status, headers });
  }

  const body = createPlaintextStream(session, start, end, {
    onDone: () => finishDownload(),
    onCancel: () => finishDownload(),
    onError: (error) => finishDownload(errorMessage(error)),
  });
  return new Response(body, { status, headers });
}
