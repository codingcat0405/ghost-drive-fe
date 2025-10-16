// crypto-worker.ts - Web Worker for encryption

// Import crypto utilities (inline or shared module)
// Removed unused function

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Listen for messages from main thread
self.onmessage = async (event) => {
  const { command, chunkData, aesKeyBase64, chunkIndex } = event.data;

  if (command === 'encrypt') {
    try {
      // Convert base64 key to CryptoKey
      const keyBuffer = base64ToArrayBuffer(aesKeyBase64);
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // Generate random IV for this chunk
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt chunk
      const encryptedChunk = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        chunkData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedChunk.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedChunk), iv.length);

      // Send back encrypted chunk with index
      self.postMessage({
        success: true,
        chunkIndex: chunkIndex,
        encryptedData: combined.buffer
      }, { transfer: [combined.buffer] }); // Transfer ownership to avoid copy

    } catch (error) {
      self.postMessage({
        success: false,
        chunkIndex: chunkIndex,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (command === 'decrypt') {
    try {
      const keyBuffer = base64ToArrayBuffer(aesKeyBase64);
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const encryptedArray = new Uint8Array(chunkData);

      // Check if chunk is too small
      if (encryptedArray.length < 12) {
        throw new Error(`Chunk ${chunkIndex} too small (${encryptedArray.length} bytes) - need at least 12 bytes for IV`);
      }

      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);

      // Check if encrypted data is too small
      if (encryptedData.length < 16) {
        throw new Error(`Chunk ${chunkIndex} encrypted data too small (${encryptedData.length} bytes) - need at least 16 bytes for GCM tag`);
      }

      const decryptedChunk = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      self.postMessage({
        success: true,
        chunkIndex: chunkIndex,
        decryptedData: decryptedChunk
      }, { transfer: [decryptedChunk] }); // Transfer ownership

    } catch (error) {
      self.postMessage({
        success: false,
        chunkIndex: chunkIndex,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};