export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
export const MAX_DOCUMENTS = 8;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}
