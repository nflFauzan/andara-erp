export interface Attachment {
  id: number;
  referenceType: string;
  referenceId: number;
  originalFilename: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  checksum?: string;
  createdAt: string;
  createdBy?: string;
  downloadUrl: string;
}
