/**
 * Ghost Drive Cryptography Utilities
 * 
 * This module handles all client-side encryption/decryption operations:
 * - Generate random AES-256 keys for file encryption
 * - Hash 6-digit PINs to create proper AES key length
 * - Encrypt/decrypt file encryption keys using PIN
 * - Validate PINs against encrypted keys
 */

// Convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Hash PIN to create proper AES key length (256 bits = 32 bytes)
const hashPin = async (pin: string): Promise<ArrayBuffer> => {
  const pinBuffer = stringToArrayBuffer(pin);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', pinBuffer);
  return hashBuffer;
};

// Generate random AES-256 key for file encryption
const generateFileEncryptionKey = async (): Promise<string> => {
  try {
    // Generate a random 256-bit (32-byte) key
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    // Export the key as raw bytes
    const rawKey = await window.crypto.subtle.exportKey('raw', key);

    // Convert to base64 for storage/transmission
    return arrayBufferToBase64(rawKey);
  } catch (error) {
    console.error('Error generating file encryption key:', error);
    throw new Error('Failed to generate encryption key');
  }
};

// Encrypt file encryption key using PIN
const encryptFileEncryptionKey = async (plainKey: string, pin: string): Promise<string> => {
  try {
    // Validate inputs
    if (!plainKey || !pin) {
      throw new Error('Plain key and PIN are required');
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    // Hash the PIN to create a proper AES key
    const pinHash = await hashPin(pin);

    // Import the hashed PIN as an AES key
    const pinKey = await window.crypto.subtle.importKey(
      'raw',
      pinHash,
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // not extractable
      ['encrypt']
    );

    // Generate a random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Convert plain key from base64 to ArrayBuffer
    const plainKeyBuffer = base64ToArrayBuffer(plainKey);

    // Encrypt the file encryption key using the PIN-derived key
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      pinKey,
      plainKeyBuffer
    );

    // Combine IV and encrypted key, then convert to base64
    const combined = new Uint8Array(iv.length + encryptedKey.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedKey), iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Error encrypting file encryption key:', error);
    throw new Error('Failed to encrypt file encryption key');
  }
};

// Decrypt file encryption key using PIN
const decryptFileEncryptionKey = async (encryptedKey: string, pin: string): Promise<string> => {
  try {
    // Validate inputs
    if (!encryptedKey || !pin) {
      throw new Error('Encrypted key and PIN are required');
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    // Hash the PIN to create a proper AES key
    const pinHash = await hashPin(pin);

    // Import the hashed PIN as an AES key
    const pinKey = await window.crypto.subtle.importKey(
      'raw',
      pinHash,
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // not extractable
      ['decrypt']
    );

    // Convert encrypted key from base64 to ArrayBuffer
    const encryptedBuffer = base64ToArrayBuffer(encryptedKey);
    const encryptedArray = new Uint8Array(encryptedBuffer);

    // Extract IV (first 12 bytes) and encrypted data
    const iv = encryptedArray.slice(0, 12);
    const encryptedData = encryptedArray.slice(12);

    // Decrypt the file encryption key
    const decryptedKey = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      pinKey,
      encryptedData
    );

    // Convert decrypted key to base64
    return arrayBufferToBase64(decryptedKey);
  } catch (error) {
    console.error('Error decrypting file encryption key:', error);
    throw new Error('Failed to decrypt file encryption key - PIN may be incorrect');
  }
};

// Validate PIN by attempting to decrypt the file encryption key
const isPinValid = async (pin: string, encryptedKey: string): Promise<boolean> => {
  try {
    await decryptFileEncryptionKey(encryptedKey, pin);
    return true;
  } catch {
    return false;
  }
};

// Encrypt a file using AES-GCM
const encryptFile = async (file: File, aesKeyBase64: string): Promise<ArrayBuffer> => {
  try {
    // Convert base64 key to CryptoKey
    const keyBuffer = base64ToArrayBuffer(aesKeyBase64);
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt']
    );

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the file
    const encryptedFile = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      fileBuffer
    );

    // Combine IV and encrypted file
    const combined = new Uint8Array(iv.length + encryptedFile.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedFile), iv.length);

    return combined.buffer;
  } catch (error) {
    console.error('Error encrypting file:', error);
    throw new Error('Failed to encrypt file');
  }
};

// Decrypt a file using AES-GCM
const decryptFile = async (encryptedFileBuffer: ArrayBuffer, aesKeyBase64: string): Promise<ArrayBuffer> => {
  try {
    // Convert base64 key to CryptoKey
    const keyBuffer = base64ToArrayBuffer(aesKeyBase64);
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    );

    const encryptedArray = new Uint8Array(encryptedFileBuffer);

    // Extract IV (first 12 bytes) and encrypted data
    const iv = encryptedArray.slice(0, 12);
    const encryptedData = encryptedArray.slice(12);

    // Decrypt the file
    const decryptedFile = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );

    return decryptedFile;
  } catch (error) {
    console.error('Error decrypting file:', error);
    throw new Error('Failed to decrypt file');
  }
};

// Convert ArrayBuffer to File object
const arrayBufferToFile = (buffer: ArrayBuffer, filename: string, mimeType: string): File => {
  return new File([buffer], filename, { type: mimeType });
};

// Convert File to ArrayBuffer
const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
  return await file.arrayBuffer();
};

const cryptoUtils = {
  generateFileEncryptionKey,
  encryptFileEncryptionKey,
  decryptFileEncryptionKey,
  isPinValid,
  encryptFile,
  decryptFile,
  arrayBufferToFile,
  fileToArrayBuffer,
  arrayBufferToBase64,
  base64ToArrayBuffer
};

export default cryptoUtils;