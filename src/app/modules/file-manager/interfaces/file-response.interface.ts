export interface FileResponse {
  // File Manager API's File schema response
  _id: string;
  name: string;
  originalname: string;
  mimetype: string;
  size: number;
  objectKey: string;
  // ... other fields
  createdAt: string;
  updatedAt: string;
}
