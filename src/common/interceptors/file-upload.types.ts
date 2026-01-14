export interface FileUploadOptions {
  destination?: string;
  allowedMimeTypes?: string[];
  maxSizeMB?: number;
  prefix?: string;
}