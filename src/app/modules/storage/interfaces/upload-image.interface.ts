// The upload image type

export interface StorageUploadImageInterface {
  size: number;
  name: string;
  usage: 'profile' | 'room-gallery' | 'room-image';
  type: 'image/jpg' | 'image/jpeg' | 'image/png';
}
