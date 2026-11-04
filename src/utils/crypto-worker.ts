// crypto-worker.ts - Web Worker that encrypts/decrypts single AES-GCM chunks off the main thread.
// Message in:  { taskId, command: 'encrypt' | 'decrypt', chunkData: ArrayBuffer, aesKeyBase64 }
// Message out: { taskId, success, data?: ArrayBuffer, error?: string }

import { IV_SIZE, TAG_SIZE } from './encrypted-chunk-layout';

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Cache the imported CryptoKey: importKey once per worker instead of once per chunk
let cachedKey: { base64: string; key: Promise<CryptoKey> } | null = null;
const getKey = (aesKeyBase64: string): Promise<CryptoKey> => {
  if (cachedKey?.base64 !== aesKeyBase64) {
    cachedKey = {
      base64: aesKeyBase64,
      key: crypto.subtle.importKey('raw', base64ToArrayBuffer(aesKeyBase64), { name: 'AES-GCM' }, false, [
        'encrypt',
        'decrypt',
      ]),
    };
  }
  return cachedKey.key;
};

const encryptChunk = async (key: CryptoKey, chunkData: ArrayBuffer): Promise<ArrayBuffer> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, chunkData);
  const combined = new Uint8Array(IV_SIZE + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), IV_SIZE);
  return combined.buffer;
};

const decryptChunk = async (key: CryptoKey, chunkData: ArrayBuffer): Promise<ArrayBuffer> => {
  if (chunkData.byteLength < IV_SIZE + TAG_SIZE) {
    throw new Error(`Encrypted chunk too small (${chunkData.byteLength} bytes)`);
  }
  // Views (no copies) over the transferred buffer
  const iv = new Uint8Array(chunkData, 0, IV_SIZE);
  const encrypted = new Uint8Array(chunkData, IV_SIZE);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
};

self.onmessage = async (event: MessageEvent) => {
  const { taskId, command, chunkData, aesKeyBase64 } = event.data;
  try {
    const key = await getKey(aesKeyBase64);
    let data: ArrayBuffer;
    if (command === 'encrypt') data = await encryptChunk(key, chunkData);
    else if (command === 'decrypt') data = await decryptChunk(key, chunkData);
    else throw new Error(`Unknown command: ${command}`);

    self.postMessage({ taskId, success: true, data }, { transfer: [data] });
  } catch (error) {
    self.postMessage({
      taskId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
