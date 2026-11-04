/**
 * Chunked (multipart) encrypted upload & download for large files.
 *
 * Pipeline per chunk: read/fetch → encrypt/decrypt in worker → PUT/collect.
 * Several chunks run in parallel (2 on mobile, 4 on desktop) so network and CPU overlap,
 * while memory stays bounded to ~concurrency × 2 × CHUNK_SIZE.
 */

import ghostDriveApi from '@/apis/ghost-drive-api';
import { createCryptoWorkerPool } from './crypto-worker-pool';
import { fetchArrayBufferWithRetry, fetchWithRetry, getChunkConcurrency, retryWithBackoff, runWithConcurrency } from './async-retry-and-concurrency';
import { CHUNK_SIZE, getChunkCount, getEncryptedChunkRange, getPlainChunkRange } from './encrypted-chunk-layout';

export interface UploadProgress {
  stage: 'encrypting' | 'uploading';
  chunkIndex?: number;
  totalChunks?: number;
  percentage: number;
}

export interface DownloadProgress {
  stage: 'downloading' | 'decrypting';
  chunkIndex?: number;
  totalChunks?: number;
  percentage: number;
}

export const encryptAndUploadLarge = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const concurrency = getChunkConcurrency();
  const pool = createCryptoWorkerPool(concurrency);

  try {
    const { uploadId, objectName, partUrls } = await ghostDriveApi.upload.getUploadMultipartUrl(objectKey, totalChunks);
    const parts: Array<{ PartNumber: number; ETag: string }> = [];
    let completedChunks = 0;

    await runWithConcurrency(totalChunks, concurrency, async (chunkIndex, slot) => {
      const { start, end } = getPlainChunkRange(chunkIndex, file.size);
      const plain = await file.slice(start, end).arrayBuffer();
      const encrypted = await pool.run(slot, 'encrypt', plain, aesKey);

      // Encrypted buffer is kept for retries (same part number is idempotent on S3/MinIO)
      const response = await fetchWithRetry(
        partUrls[chunkIndex].url,
        { method: 'PUT', body: encrypted, headers: { 'Content-Type': 'application/octet-stream' } },
        `Upload chunk ${chunkIndex + 1}/${totalChunks}`
      );

      const etag = response.headers.get('ETag')?.replace(/"/g, '');
      if (!etag) {
        throw new Error('Upload response has no ETag header (check MinIO CORS ExposeHeaders: ETag)');
      }
      parts.push({ PartNumber: chunkIndex + 1, ETag: etag });
      completedChunks++;

      // Cap at 99%: 100% is only reported after the multipart upload is completed
      onProgress?.({
        stage: 'uploading',
        chunkIndex: completedChunks,
        totalChunks,
        percentage: Math.min(99, (completedChunks / totalChunks) * 100),
      });
    });

    parts.sort((a, b) => a.PartNumber - b.PartNumber);
    await retryWithBackoff(() => ghostDriveApi.upload.completeUploadMultipart(objectName, uploadId, parts), {
      retries: 2,
    });
    onProgress?.({ stage: 'uploading', chunkIndex: totalChunks, totalChunks, percentage: 100 });
  } finally {
    pool.terminate();
  }
};

/**
 * Download + decrypt into a Blob. Only used as a fallback when the streaming service worker
 * is unavailable — the Blob holds the whole file in memory.
 */
export const decryptAndDownloadLarge = async (
  objectKey: string,
  aesKey: string,
  originalFileSize: number,
  mimeType: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  const totalChunks = getChunkCount(originalFileSize);
  const concurrency = getChunkConcurrency();
  const pool = createCryptoWorkerPool(concurrency);

  try {
    const { downloadUrl } = await ghostDriveApi.upload.getDownloadUrl(objectKey);
    const decryptedChunks: Blob[] = new Array(totalChunks);
    let completedChunks = 0;

    await runWithConcurrency(totalChunks, concurrency, async (chunkIndex, slot) => {
      const range = getEncryptedChunkRange(chunkIndex, originalFileSize);
      const encrypted = await fetchArrayBufferWithRetry(
        downloadUrl,
        { headers: { Range: `bytes=${range.start}-${range.endInclusive}` } },
        `Download chunk ${chunkIndex + 1}/${totalChunks}`
      );

      const decrypted = await pool.run(slot, 'decrypt', encrypted, aesKey);
      // Wrapping in a Blob lets Chrome page large data out of the JS heap
      decryptedChunks[chunkIndex] = new Blob([decrypted]);
      completedChunks++;

      onProgress?.({
        stage: 'decrypting',
        chunkIndex: completedChunks,
        totalChunks,
        percentage: (completedChunks / totalChunks) * 100,
      });
    });

    return new Blob(decryptedChunks, { type: mimeType });
  } finally {
    pool.terminate();
  }
};
