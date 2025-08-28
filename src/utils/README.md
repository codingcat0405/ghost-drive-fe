# Ghost Drive Cryptography Module

This module provides all the client-side cryptography functions for the Ghost Drive secure file storage system. It implements true end-to-end encryption where files are encrypted on the client side and only encrypted data is sent to the server.

## 🔐 Security Features

- **AES-256-GCM Encryption**: Industry-standard encryption for files
- **PIN-Based Key Protection**: 6-digit PINs protect encryption keys
- **Client-Side Key Generation**: AES keys generated locally, never on server
- **Zero-Knowledge Architecture**: Server cannot decrypt user files
- **SHA-256 PIN Hashing**: 6-digit PINs are hashed to create proper AES key length

## 📦 Available Functions

### Core Functions

```typescript
import cryptoUtils from './crypto';

// Generate a random AES-256 key for file encryption
const fileKey = await cryptoUtils.generateFileEncryptionKey();

// Encrypt the file encryption key using a 6-digit PIN
const encryptedKey = await cryptoUtils.encryptFileEncryptionKey(fileKey, "123456");

// Decrypt the file encryption key using the PIN
const decryptedKey = await cryptoUtils.decryptFileEncryptionKey(encryptedKey, "123456");

// Validate a PIN without throwing errors
const isValid = await cryptoUtils.isPinValid("123456", encryptedKey);
```

### File Operations

```typescript
// Encrypt a file using an AES key
const encryptedFileBuffer = await cryptoUtils.encryptFile(file, aesKeyBase64);

// Decrypt a file using an AES key
const decryptedFileBuffer = await cryptoUtils.decryptFile(encryptedFileBuffer, aesKeyBase64);

// Convert ArrayBuffer to File object
const file = cryptoUtils.arrayBufferToFile(buffer, "filename.txt", "text/plain");

// Convert File to ArrayBuffer
const buffer = await cryptoUtils.fileToArrayBuffer(file);
```

### Utility Functions

```typescript
// Convert ArrayBuffer to base64 string
const base64 = cryptoUtils.arrayBufferToBase64(buffer);

// Convert base64 string to ArrayBuffer
const buffer = cryptoUtils.base64ToArrayBuffer(base64);
```

## 🔄 Complete Workflow Examples

### User Registration

```typescript
const registerUser = async (username: string, password: string, pin: string) => {
  // 1. Generate file encryption key
  const fileKey = await cryptoUtils.generateFileEncryptionKey();
  
  // 2. Encrypt key with PIN
  const encryptedKey = await cryptoUtils.encryptFileEncryptionKey(fileKey, pin);
  
  // 3. Send to backend (PIN never leaves client)
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      aesKeyEncrypted: encryptedKey // Only encrypted key sent
    })
  });
  
  return { success: true, fileKey }; // Keep fileKey locally
};
```

### File Upload

```typescript
const uploadFile = async (file: File, fileKey: string, path: string = "/") => {
  // 1. Encrypt the file
  const encryptedBuffer = await cryptoUtils.encryptFile(file, fileKey);
  const encryptedFile = cryptoUtils.arrayBufferToFile(
    encryptedBuffer,
    file.name + ".encrypted",
    "application/octet-stream"
  );
  
  // 2. Get upload URL from backend
  const uploadUrlResponse = await fetch(`/api/files/upload-url?filename=${file.name}&path=${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { uploadUrl } = await uploadUrlResponse.json();
  
  // 3. Upload encrypted file directly to MinIO
  await fetch(uploadUrl, {
    method: 'PUT',
    body: encryptedFile
  });
  
  // 4. Store file metadata
  await fetch('/api/files/metadata', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: file.name,
      objectKey: file.name + ".encrypted",
      path,
      size: encryptedFile.size,
      mimeType: file.type
    })
  });
};
```

### File Download

```typescript
const downloadFile = async (fileId: number, fileKey: string) => {
  // 1. Get download URL from backend
  const downloadUrlResponse = await fetch(`/api/files/download-url/${fileId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { downloadUrl } = await downloadUrlResponse.json();
  
  // 2. Download encrypted file from MinIO
  const encryptedFileResponse = await fetch(downloadUrl);
  const encryptedFile = await encryptedFileResponse.blob();
  
  // 3. Convert to ArrayBuffer
  const encryptedBuffer = await encryptedFile.arrayBuffer();
  
  // 4. Decrypt the file
  const decryptedBuffer = await cryptoUtils.decryptFile(encryptedBuffer, fileKey);
  
  // 5. Create downloadable file
  const decryptedFile = cryptoUtils.arrayBufferToFile(
    decryptedBuffer,
    "decrypted-file.txt",
    "text/plain"
  );
  
  // 6. Trigger download
  const url = URL.createObjectURL(decryptedFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = decryptedFile.name;
  a.click();
  URL.revokeObjectURL(url);
};
```

### User Login

```typescript
const loginUser = async (username: string, password: string, pin: string) => {
  // 1. Login to get JWT token and encrypted key
  const loginResponse = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const { token, aesKeyEncrypted } = await loginResponse.json();
  
  // 2. Decrypt the file encryption key using PIN
  const fileKey = await cryptoUtils.decryptFileEncryptionKey(aesKeyEncrypted, pin);
  
  // 3. Validate PIN
  const isValidPin = await cryptoUtils.isPinValid(pin, aesKeyEncrypted);
  
  if (!isValidPin) {
    throw new Error('Invalid PIN');
  }
  
  return { token, fileKey };
};
```

### PIN Change

```typescript
const changePin = async (oldPin: string, newPin: string, encryptedKey: string) => {
  // 1. Decrypt with old PIN
  const fileKey = await cryptoUtils.decryptFileEncryptionKey(encryptedKey, oldPin);
  
  // 2. Encrypt with new PIN
  const newEncryptedKey = await cryptoUtils.encryptFileEncryptionKey(fileKey, newPin);
  
  // 3. Update on backend
  await fetch('/api/users/update-aes-key-encrypted', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      aesKeyEncrypted: newEncryptedKey
    })
  });
  
  return { success: true };
};
```

## 🔒 Security Considerations

### PIN Requirements

- Must be exactly 6 digits (0-9)
- Should be unique and not easily guessable
- Consider implementing PIN strength requirements

### Key Management

- File encryption keys are generated randomly for each user
- Keys are encrypted with PIN-derived keys before storage
- Never store plain PINs or plain file encryption keys
- Consider implementing key rotation mechanisms

### Error Handling

- Always handle encryption/decryption errors gracefully
- Don't expose sensitive information in error messages
- Validate inputs before processing

### Browser Compatibility

- Requires modern browsers with Web Crypto API support
- Test on target browsers before deployment
- Consider fallback mechanisms for older browsers

## 🧪 Testing

Use the example functions in `crypto-example.ts` to test the cryptography module:

```typescript
import { exampleFileWorkflow, exampleFileEncryption } from './crypto-example';

// Test basic workflow
const result = await exampleFileWorkflow();
console.log(result);

// Test file encryption
const file = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
const fileResult = await exampleFileEncryption(file);
console.log(fileResult);
```

## 📚 API Reference

### `generateFileEncryptionKey(): Promise<string>`

Generates a random AES-256 key and returns it as a base64 string.

### `encryptFileEncryptionKey(plainKey: string, pin: string): Promise<string>`

Encrypts a file encryption key using a 6-digit PIN. Returns the encrypted key as base64.

### `decryptFileEncryptionKey(encryptedKey: string, pin: string): Promise<string>`

Decrypts a file encryption key using a 6-digit PIN. Returns the plain key as base64.

### `isPinValid(pin: string, encryptedKey: string): Promise<boolean>`

Validates a PIN by attempting to decrypt the key. Returns true if valid, false otherwise.

### `encryptFile(file: File, aesKeyBase64: string): Promise<ArrayBuffer>`

Encrypts a file using AES-GCM. Returns the encrypted file as ArrayBuffer.

### `decryptFile(encryptedFileBuffer: ArrayBuffer, aesKeyBase64: string): Promise<ArrayBuffer>`

Decrypts a file using AES-GCM. Returns the decrypted file as ArrayBuffer.

### `arrayBufferToFile(buffer: ArrayBuffer, filename: string, mimeType: string): File`

Converts an ArrayBuffer to a File object.

### `fileToArrayBuffer(file: File): Promise<ArrayBuffer>`

Converts a File object to an ArrayBuffer.

### `arrayBufferToBase64(buffer: ArrayBuffer): string`

Converts an ArrayBuffer to a base64 string.

### `base64ToArrayBuffer(base64: string): ArrayBuffer`

Converts a base64 string to an ArrayBuffer.

## ⚠️ Important Notes

1. **PIN Security**: The strength of encryption depends on the PIN. Users should choose strong, unique PINs.

2. **Key Storage**: Never store plain file encryption keys. Always encrypt them with PIN-derived keys.

3. **Error Handling**: Always handle potential errors in encryption/decryption operations.

4. **Browser Security**: This module relies on the Web Crypto API, which is only available in secure contexts (HTTPS).

5. **Zero-Knowledge**: The server never sees plain PINs or plain file encryption keys, ensuring true zero-knowledge architecture.
