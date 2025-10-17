export const sanitizeFileName = (originalFileName: string) => {
  const parts = originalFileName.split('.');
  const fileExtension = parts.pop();
  const fileName = parts.join('.');
  
  // Replace all special characters with underscore
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
  
  // Add timestamp prefix and reconstruct filename
  const timestamp = new Date().getTime();
  const normalizedFileName = `${timestamp}_${sanitizedFileName}.${fileExtension}`;
  
  return normalizedFileName;
}

export const shortenFileName = (fileName: string) => {
  if (fileName.length <= 20) return fileName;
  return fileName.slice(0, 16) + '...' + fileName.slice(-4);
}