/**
 * Ghost Drive Cryptography Utilities
 * Simplified version with smart encrypt/decrypt
 */

import ghostDriveApi from '@/apis/ghost-drive-api';
import { fetchArrayBufferWithRetry, fetchWithRetry } from './async-retry-and-concurrency';
import {
  decryptAndDownloadLarge,
  encryptAndUploadLarge,
  type DownloadProgress,
  type UploadProgress,
} from './chunked-encrypted-file-transfer';
import { CHUNK_SIZE, IV_SIZE } from './encrypted-chunk-layout';
import { acquireScreenWakeLock } from './screen-wake-lock';

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
  return encoder.encode(str).buffer;
};

const hashPin = async (pin: string): Promise<ArrayBuffer> => {
  const pinBuffer = stringToArrayBuffer(pin);
  return await window.crypto.subtle.digest('SHA-256', pinBuffer);
};

// ============= CONSTANTS =============

// Files below one chunk are uploaded with a single PUT (same on-disk layout as 1 chunk)
const MULTIPART_THRESHOLD = CHUNK_SIZE;

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

// ============= SMALL FILE ENCRYPT & UPLOAD =============

const encryptAndUploadSmall = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  onProgress?.({ stage: 'encrypting', percentage: 0 });

  const key = await window.crypto.subtle.importKey(
    'raw',
    base64ToArrayBuffer(aesKey),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const encryptedFile = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());

  const combined = new Uint8Array(iv.length + encryptedFile.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedFile), iv.length);

  onProgress?.({ stage: 'uploading', percentage: 50 });

  const { uploadUrl } = await ghostDriveApi.upload.getUploadUrl(objectKey);
  await fetchWithRetry(
    uploadUrl,
    { method: 'PUT', body: combined, headers: { 'Content-Type': 'application/octet-stream' } },
    'Upload'
  );

  onProgress?.({ stage: 'uploading', percentage: 100 });
};

// ============= SMART ENCRYPT & UPLOAD =============

/**
 * Smart encrypt and upload - automatically chooses strategy based on file size.
 * Keeps the screen awake meanwhile (mobile tabs get frozen when the screen turns off).
 */
const encryptAndUpload = async (
  file: File,
  aesKey: string,
  objectKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  const releaseWakeLock = await acquireScreenWakeLock();
  try {
    if (file.size < MULTIPART_THRESHOLD) {
      await encryptAndUploadSmall(file, aesKey, objectKey, onProgress);
    } else {
      await encryptAndUploadLarge(file, aesKey, objectKey, onProgress);
    }
  } finally {
    releaseWakeLock();
  }
};

// ============= SMALL FILE DOWNLOAD & DECRYPT =============

const decryptAndDownloadSmall = async (
  objectKey: string,
  aesKey: string,
  mimeType: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  onProgress?.({ stage: 'downloading', percentage: 0 });

  const { downloadUrl } = await ghostDriveApi.upload.getDownloadUrl(objectKey);
  const encryptedData = await fetchArrayBufferWithRetry(downloadUrl, {}, 'Download');

  onProgress?.({ stage: 'decrypting', percentage: 50 });

  const key = await window.crypto.subtle.importKey(
    'raw',
    base64ToArrayBuffer(aesKey),
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Views over the downloaded buffer — avoids copying
  const iv = new Uint8Array(encryptedData, 0, IV_SIZE);
  const encrypted = new Uint8Array(encryptedData, IV_SIZE);
  const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

  onProgress?.({ stage: 'decrypting', percentage: 100 });

  return new Blob([decrypted], { type: mimeType });
};

// ============= SMART DECRYPT & DOWNLOAD =============

/**
 * Download + decrypt a whole file into a Blob (in memory).
 * Prefer the streaming service worker (decrypt-stream-service-worker-client.ts) for large files.
 * @param originalFileSize - ORIGINAL file size BEFORE encryption
 * @param mimeType - set on the Blob so media elements (esp. mobile Chrome) can play it
 */
const decryptAndDownload = async (
  objectKey: string,
  aesKey: string,
  originalFileSize: number,
  mimeType = 'application/octet-stream',
  onProgress?: (progress: DownloadProgress) => void
): Promise<Blob> => {
  const releaseWakeLock = await acquireScreenWakeLock();
  try {
    if (originalFileSize < MULTIPART_THRESHOLD) {
      return await decryptAndDownloadSmall(objectKey, aesKey, mimeType, onProgress);
    }
    return await decryptAndDownloadLarge(objectKey, aesKey, originalFileSize, mimeType, onProgress);
  } finally {
    releaseWakeLock();
  }
};

// ============= TEXT ENCRYPT & DECRYPT =============

const encryptText = async (text: string, aesKey: string): Promise<string> => {
  const keyBuffer = base64ToArrayBuffer(aesKey);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generate random IV
  const textBuffer = stringToArrayBuffer(text);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textBuffer
  );

  // Prepend IV to encrypted data (like you do in file encryption)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined.buffer);
};

const decryptText = async (encryptedText: string, aesKey: string): Promise<string> => {
  const keyBuffer = base64ToArrayBuffer(aesKey);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const encryptedBuffer = base64ToArrayBuffer(encryptedText);
  const encryptedArray = new Uint8Array(encryptedBuffer);

  const iv = encryptedArray.slice(0, 12);
  const encrypted = encryptedArray.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  // Convert ArrayBuffer back to string (not base64!)
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
// ============= EXPORTS =============

const cryptoUtils = {
  generateFileEncryptionKey,
  encryptFileEncryptionKey,
  decryptFileEncryptionKey,
  encryptAndUpload,
  decryptAndDownload,
  encryptText,
  decryptText
};

export default cryptoUtils;