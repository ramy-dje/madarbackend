// The upload file type

export interface StorageUploadFileInterface {
  size: number;
  name: string;
  usage: 'cv' | 'csv-data' | 'text-data';
  type: 'application/pdf' | 'text/plain' | 'text/csv';
}
