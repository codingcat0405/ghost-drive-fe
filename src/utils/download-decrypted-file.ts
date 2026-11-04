/**
 * Save a decrypted file to disk.
 * - Preferred: stream through the decrypt service worker → constant memory, any file size.
 * - Fallback: decrypt into a Blob (whole file in memory) and click an object-URL link.
 */

import ghostDriveApi from '@/apis/ghost-drive-api';
import cryptoUtils from './crypto';
import {
  ensureDecryptStreamServiceWorker,
  registerDecryptStream,
  triggerStreamDownload,
} from './decrypt-stream-service-worker-client';

export interface DecryptableFile {
  name: string;
  size: number; // ORIGINAL size
  mimeType: string;
  objectKey: string;
}

export const saveBlobUrlAs = (blobUrl: string, fileName: string) => {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** @param existingBlobUrl - already decrypted preview Blob URL to reuse (avoids decrypting twice) */
export const downloadDecryptedFile = async (
  file: DecryptableFile,
  aesKey: string,
  existingBlobUrl?: string | null,
  onStreamError?: (message: string) => void
): Promise<'streaming' | 'saved'> => {
  if (existingBlobUrl?.startsWith('blob:')) {
    saveBlobUrlAs(existingBlobUrl, file.name);
    return 'saved';
  }

  if (await ensureDecryptStreamServiceWorker()) {
    const { downloadUrl } = await ghostDriveApi.upload.getDownloadUrl(file.objectKey);
    // One-shot session: released by the SW when the download finishes/fails (not on dialog close)
    const stream = registerDecryptStream(
      {
        objectKey: file.objectKey,
        downloadUrl,
        aesKey,
        size: file.size,
        mimeType: file.mimeType || 'application/octet-stream',
        fileName: file.name,
      },
      { download: true, onError: onStreamError }
    );
    triggerStreamDownload(stream.url);
    return 'streaming';
  }

  const blob = await cryptoUtils.decryptAndDownload(file.objectKey, aesKey, file.size, file.mimeType);
  const url = URL.createObjectURL(blob);
  saveBlobUrlAs(url, file.name);
  // Revoking right after click() can abort the download on mobile → delay it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'saved';
};
