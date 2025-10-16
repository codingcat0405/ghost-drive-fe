/**
 * Ghost Drive Cryptography Utilities
 * Simplified version with smart encrypt/decrypt
 */

import ghostDriveApi from '@/apis/ghost-drive-api';

// ============= UTILITY FUNCTIONS =============

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

const hashPin = async (pin: string): Promise<ArrayBuffer> => {
  const pinBuffer = stringToArrayBuffer(pin);
  return await window.crypto.subtle.digest('SHA-256', pinBuffer);
};

// ============= CONSTANTS =============

const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB chunks - optimal balance of memory efficiency and performance
const IV_SIZE = 12; // AES-GCM IV size
const TAG_SIZE = 16; // AES-GCM authentication tag size
const ENCRYPTION_OVERHEAD = IV_SIZE + TAG_SIZE; // 28 bytes per chunk

const MULTIPART_THRESHOLD = 25 * 1024 * 1024; // 25MB threshold

// ============= PROGRESS INTERFACES =============

interface UploadProgress {
  stage: 'encrypting' | 'uploading';
  chunkIndex?: number;
  totalChunks?: number;
  percentage: number;
}

interface DownloadProgress {
  stage: 'downloading' | 'decrypting';
  chunkIndex?: number;
  totalChunks?: number;
  percentage: number;
}

// ============= CORE FUNCTIONS =============

/**
 * Generate random AES-256 key for file encryption
 */
const generateFileEncryptionKey = async (): Promise<string> => {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(rawKey);
};

/**
 * Encrypt the AES key with PIN for storage in database
 */
const encryptFileEncryptionKey = async (plainKey: string, pin: string): Promise<string> => {
  if (!plainKey || !pin) throw new Error('Plain key and PIN are required');
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) throw new Error('PIN must be 6 digits');

  const pinHash = await hashPin(pin);
  const pinKey = await window.crypto.subtle.importKey(
    'raw',
    pinHash,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plainKeyBuffer = base64ToArrayBuffer(plainKey);

  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    pinKey,
    plainKeyBuffer
  );

  const combined = new Uint8Array(iv.length + encryptedKey.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedKey), iv.length);

  return arrayBufferToBase64(combined.buffer);
};

/**
 * Decrypt the AES key using PIN
 */
const decryptFileEncryptionKey = async (encryptedKey: string, pin: string): Promise<string> => {
  if (!encryptedKey || !pin) throw new Error('Encrypted key and PIN are required');
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) throw new Error('PIN must be 6 digits');

  const pinHash = await hashPin(pin);
  const pinKey = await window.crypto.subtle.importKey(
    'raw',
    pinHash,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const encryptedBuffer = base64ToArrayBuffer(encryptedKey);
  const encryptedArray = new Uint8Array(encryptedBuffer);

  const iv = encryptedArray.slice(0, 12);
  const encryptedData = encryptedArray.slice(12);

  const decryptedKey = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    pinKey,
    encryptedData
  );

  return arrayBufferToBase64(decryptedKey);
};

// ============= WORKER MANAGEMENT =============

const createWorkerPool = (size: number): Worker[] => {
  const workers: Worker[] = [];
  for (let i = 0; i < size; i++) {
    workers.push(new Worker(new URL('./crypto-worker.ts', import.meta.url)));
  }
  return workers;
};

// ============= SMALL FILE ENCRYPT & UPLOAD =============

const encryptAndUploadSmall = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  onProgress?.({ stage: 'encrypting', percentage: 0 });

  // Encrypt entire file
  const keyBuffer = base64ToArrayBuffer(aesKey);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedFile = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  const combined = new Uint8Array(iv.length + encryptedFile.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedFile), iv.length);

  onProgress?.({ stage: 'uploading', percentage: 50 });

  // Get presigned URL and upload
  const { uploadUrl } = await ghostDriveApi.user.getUploadUrl(objectKey);

  await fetch(uploadUrl, {
    method: 'PUT',
    body: combined,
    headers: { 'Content-Type': 'application/octet-stream' }
  });

  onProgress?.({ stage: 'uploading', percentage: 100 });
};

// ============= LARGE FILE ENCRYPT & UPLOAD =============

const encryptAndUploadLarge = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);
  const workers = createWorkerPool(workerCount);

  try {
    // Initialize multipart upload
    const { uploadId, objectName, partUrls } = await ghostDriveApi.user.getUploadMultipartUrl(
      objectKey,
      totalChunks
    );

    const encryptedParts: Array<{ PartNumber: number; ETag: string }> = [];
    let currentWorkerIndex = 0;
    let completedChunks = 0;

    // Process chunks sequentially to minimize memory usage
    const processChunk = (chunkIndex: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        chunk.arrayBuffer().then(chunkData => {
          const worker = workers[currentWorkerIndex % workers.length];
          currentWorkerIndex++;

          worker.onmessage = async (event) => {
            const { success, encryptedData, error } = event.data;

            if (!success) {
              reject(new Error(error));
              return;
            }

            try {
              // Upload encrypted chunk
              const partUrl = partUrls[chunkIndex].url;
              const uploadResponse = await fetch(partUrl, {
                method: 'PUT',
                body: encryptedData,
                headers: { 'Content-Type': 'application/octet-stream' }
              });

              if (!uploadResponse.ok) {
                throw new Error(`Upload failed for chunk ${chunkIndex}`);
              }

              const etag = uploadResponse.headers.get('ETag')?.replace(/"/g, '') || '';

              encryptedParts.push({
                PartNumber: chunkIndex + 1,
                ETag: etag
              });

              completedChunks++;

              onProgress?.({
                stage: 'uploading',
                chunkIndex: completedChunks,
                totalChunks,
                percentage: (completedChunks / totalChunks) * 100
              });

              resolve();
            } catch (error) {
              reject(error);
            }
          };

          worker.postMessage({
            command: 'encrypt',
            chunkData,
            aesKeyBase64: aesKey,
            chunkIndex
          }, [chunkData]);
        }).catch(reject);
      });
    };

    // Process chunks sequentially (one at a time) to minimize memory usage
    for (let i = 0; i < totalChunks; i++) {
      await processChunk(i);
      // Force garbage collection hint
      if (i % 2 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Complete multipart upload
    encryptedParts.sort((a, b) => a.PartNumber - b.PartNumber);
    await ghostDriveApi.user.completeUploadMultipart(objectName, uploadId, encryptedParts);

  } finally {
    workers.forEach(w => w.terminate());
  }
};

// ============= SMART ENCRYPT & UPLOAD =============

/**
 * Smart encrypt and upload - automatically chooses strategy based on file size
 */
const encryptAndUpload = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  if (file.size < MULTIPART_THRESHOLD) {
    console.log('Using simple upload for small file');
    await encryptAndUploadSmall(file, aesKey, objectKey, onProgress);
  } else {
    console.log('Using chunked upload for large file');
    await encryptAndUploadLarge(file, aesKey, objectKey, onProgress);
  }
};

// ============= SMALL FILE DOWNLOAD & DECRYPT =============

const decryptAndDownloadSmall = async (
  objectKey: string,
  aesKey: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  try {
    onProgress?.({ stage: 'downloading', percentage: 0 });

    // Download encrypted file
    const { downloadUrl } = await ghostDriveApi.user.getDownloadUrl(objectKey);
    console.log('Downloading from URL:', downloadUrl);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const encryptedData = await response.arrayBuffer();
    console.log('Downloaded encrypted data, size:', encryptedData.byteLength);

    onProgress?.({ stage: 'decrypting', percentage: 50 });

    // Decrypt
    const keyBuffer = base64ToArrayBuffer(aesKey);
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const iv = encryptedArray.slice(0, 12);
    const encrypted = encryptedArray.slice(12);

    console.log('Decrypting data, IV length:', iv.length, 'Encrypted length:', encrypted.length);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    onProgress?.({ stage: 'decrypting', percentage: 100 });

    return new Blob([decrypted]);
  } catch (error) {
    console.error('Download/decrypt error:', error);
    throw error;
  }
};

// ============= LARGE FILE DOWNLOAD & DECRYPT =============

// ============= LARGE FILE DOWNLOAD & DECRYPT (FIXED) =============

const decryptAndDownloadLarge = async (
  objectKey: string,
  aesKey: string,
  originalFileSize: number, // IMPORTANT: This should be the ORIGINAL file size before encryption
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  // Calculate expected encrypted file size
  const totalChunks = Math.ceil(originalFileSize / CHUNK_SIZE);

  // Calculate encrypted chunk sizes
  const encryptedChunkSizes: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, originalFileSize);
    const originalChunkSize = end - start;
    const encryptedChunkSize = originalChunkSize + ENCRYPTION_OVERHEAD;
    encryptedChunkSizes.push(encryptedChunkSize);
  }

  const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);
  const workers = createWorkerPool(workerCount);

  try {
    const { downloadUrl } = await ghostDriveApi.user.getDownloadUrl(objectKey);

    const decryptedChunks: Blob[] = [];
    let currentWorkerIndex = 0;
    let completedChunks = 0;

    // Process chunk with Range-based download
    const processChunk = (chunkIndex: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Calculate start position in encrypted file
        let encryptedStart = 0;
        for (let i = 0; i < chunkIndex; i++) {
          encryptedStart += encryptedChunkSizes[i];
        }

        const encryptedEnd = encryptedStart + encryptedChunkSizes[chunkIndex] - 1;

        // Download only this chunk using Range header
        fetch(downloadUrl, {
          headers: { Range: `bytes=${encryptedStart}-${encryptedEnd}` }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Range download failed for chunk ${chunkIndex}: ${response.status}`);
          }
          return response.arrayBuffer();
        }).then(encryptedChunkData => {
          console.log(`Downloaded chunk ${chunkIndex}, size: ${encryptedChunkData.byteLength} bytes`);

          const worker = workers[currentWorkerIndex % workers.length];
          currentWorkerIndex++;

          worker.onmessage = (event) => {
            const { success, decryptedData, error } = event.data;

            if (!success) {
              reject(new Error(`Decryption failed for chunk ${chunkIndex}: ${error}`));
              return;
            }

            decryptedChunks[chunkIndex] = new Blob([decryptedData]);
            completedChunks++;

            onProgress?.({
              stage: 'decrypting',
              chunkIndex: completedChunks,
              totalChunks,
              percentage: (completedChunks / totalChunks) * 100
            });

            resolve();
          };

          worker.postMessage(
            {
              command: 'decrypt',
              chunkData: encryptedChunkData,
              aesKeyBase64: aesKey,
              chunkIndex
            },
            [encryptedChunkData]
          );
        }).catch(reject);
      });
    };

    // Process chunks sequentially to minimize memory usage
    for (let i = 0; i < totalChunks; i++) {
      await processChunk(i);
      // Force garbage collection hint
      if (i % 2 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    return new Blob(decryptedChunks);

  } finally {
    workers.forEach(w => w.terminate());
  }
};

// ============= SMART DECRYPT & DOWNLOAD (UPDATED) =============

/**
 * Smart decrypt and download - automatically chooses strategy
 * @param objectKey - MinIO object key
 * @param aesKey - Base64 encoded AES key
 * @param originalFileSize - ORIGINAL file size BEFORE encryption
 * @param onProgress - Progress callback
 */
const decryptAndDownload = async (
  objectKey: string,
  aesKey: string,
  originalFileSize: number, // Must be original size, not encrypted size
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  if (originalFileSize < MULTIPART_THRESHOLD) {
    console.log('Using simple download for small file');
    return await decryptAndDownloadSmall(objectKey, aesKey, onProgress);
  } else {
    console.log('Using chunked download for large file');
    return await decryptAndDownloadLarge(objectKey, aesKey, originalFileSize, onProgress);
  }
};

// ============= EXPORTS =============

const cryptoUtils = {
  generateFileEncryptionKey,
  encryptFileEncryptionKey,
  decryptFileEncryptionKey,
  encryptAndUpload,
  decryptAndDownload
};

export default cryptoUtils;