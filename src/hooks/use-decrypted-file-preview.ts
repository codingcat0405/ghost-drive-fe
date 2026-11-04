/**
 * Builds a preview URL for an encrypted file while the preview dialog is open.
 *
 * - video/audio: streamed through the decrypt service worker (plays after the first chunk, seekable,
 *   bounded memory) — no size limit.
 * - images, or media when the SW is unavailable: decrypt into a Blob, limited in size because the
 *   whole file is held in memory.
 * All URLs/sessions are released when the dialog closes or the file changes.
 */

import { useEffect, useState } from 'react';
import ghostDriveApi from '@/apis/ghost-drive-api';
import cryptoUtils from '@/utils/crypto';
import {
  ensureDecryptStreamServiceWorker,
  registerDecryptStream,
} from '@/utils/decrypt-stream-service-worker-client';
import type { DecryptableFile } from '@/utils/download-decrypted-file';

const MB = 1024 * 1024;
const IN_MEMORY_PREVIEW_LIMITS: Record<PreviewKind, number> = {
  image: 50 * MB,
  audio: 50 * MB,
  video: 100 * MB,
};

export type PreviewKind = 'image' | 'audio' | 'video';

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'unsupported'; reason: string }
  | { status: 'error'; reason: string };

export const getPreviewKind = (mimeType: string): PreviewKind | null => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return null;
};

export const useDecryptedFilePreview = (open: boolean, file: DecryptableFile, aesKey?: string) => {
  const [state, setState] = useState<PreviewState>({ status: 'idle' });

  useEffect(() => {
    if (!open || !aesKey || !file.objectKey) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    // Registers a resource to release; releases immediately if the effect is already gone
    const own = (release: () => void) => (cancelled ? release() : (cleanup = release));

    (async () => {
      const kind = getPreviewKind(file.mimeType);
      if (!kind) {
        setState({ status: 'unsupported', reason: 'Preview not supported for this file type.' });
        return;
      }
      setState({ status: 'loading' });

      if (kind !== 'image' && (await ensureDecryptStreamServiceWorker())) {
        const { downloadUrl } = await ghostDriveApi.upload.getDownloadUrl(file.objectKey);
        const stream = registerDecryptStream({
          objectKey: file.objectKey,
          downloadUrl,
          aesKey,
          size: file.size,
          mimeType: file.mimeType,
          fileName: file.name,
        });
        own(stream.release);
        if (!cancelled) setState({ status: 'ready', url: stream.url });
        return;
      }

      const limit = IN_MEMORY_PREVIEW_LIMITS[kind];
      if (file.size > limit) {
        setState({
          status: 'unsupported',
          reason: `File is too large to preview on this browser (max ${limit / MB}MB). Please download it instead.`,
        });
        return;
      }

      const blob = await cryptoUtils.decryptAndDownload(file.objectKey, aesKey, file.size, file.mimeType);
      const url = URL.createObjectURL(blob);
      // Delayed revoke: a Download click reusing this URL right before closing must still finish
      own(() => setTimeout(() => URL.revokeObjectURL(url), 60_000));
      if (!cancelled) setState({ status: 'ready', url });
    })().catch((error: unknown) => {
      console.error('Preview failed:', error);
      if (!cancelled) {
        setState({ status: 'error', reason: error instanceof Error ? error.message : String(error) });
      }
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [open, aesKey, file.objectKey, file.size, file.mimeType, file.name]);

  return [state, setState] as const;
};
