/**
 * Layout of an encrypted Ghost Drive object.
 *
 * Plaintext is split into fixed CHUNK_SIZE chunks, each encrypted independently with AES-GCM:
 *   [IV (12 bytes) | ciphertext | GCM tag (16 bytes)] [IV | ciphertext | tag] ...
 * Files smaller than CHUNK_SIZE are simply a single chunk with the same layout.
 *
 * Because every chunk has a predictable size, any plaintext byte range maps to an exact
 * encrypted byte range → random access (video seeking) without downloading the whole file.
 *
 * NOTE: public/decrypt-stream-sw.js mirrors these constants (plain JS service worker,
 * not bundled). Keep both in sync — changing them breaks every existing file.
 */

export const CHUNK_SIZE = 25 * 1024 * 1024;
export const IV_SIZE = 12;
export const TAG_SIZE = 16;
export const ENCRYPTION_OVERHEAD = IV_SIZE + TAG_SIZE;

/** Number of encrypted chunks for an ORIGINAL (plaintext) file size */
export const getChunkCount = (plainSize: number): number =>
  Math.max(1, Math.ceil(plainSize / CHUNK_SIZE));

/** Plaintext byte range [start, end) covered by a chunk */
export const getPlainChunkRange = (chunkIndex: number, plainSize: number) => {
  const start = chunkIndex * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, plainSize);
  return { start, end };
};

/** Encrypted byte range (inclusive end, ready for an HTTP Range header) of a chunk */
export const getEncryptedChunkRange = (chunkIndex: number, plainSize: number) => {
  const { start, end } = getPlainChunkRange(chunkIndex, plainSize);
  const encryptedStart = chunkIndex * (CHUNK_SIZE + ENCRYPTION_OVERHEAD);
  const encryptedEndInclusive = encryptedStart + (end - start) + ENCRYPTION_OVERHEAD - 1;
  return { start: encryptedStart, endInclusive: encryptedEndInclusive };
};
