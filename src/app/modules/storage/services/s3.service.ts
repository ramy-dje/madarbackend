import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

// * This module is for S3 configuration

@Injectable()
export class S3Service {
  // Bucket
  Bucket: string = process.env.STORAGE_CLOUDFLARE_BUCKET_NAME;
  // Public URL
  Public_URL: string = process.env.STORAGE_CLOUDFLARE_ACCESS_PUBLIC_URL;
  // Image Key
  Image_Key = 'images';
  // Image Key
  File_Key = 'files';
  // S3Client
  S3_Client = new S3Client({
    region: 'auto',
    endpoint: process.env.STORAGE_CLOUDFLARE_S3API ?? '',
    credentials: {
      accessKeyId: process.env.STORAGE_CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_CLOUDFLARE_ACCESS_KEY_SECRET,
    },
  });

  // Limits
  Image_Size_Limit: number = 1024 * 1024 * 5; // 5MB
  File_Size_Limit: number = 1024 * 1024 * 10; // 10MB

  // content path
  ContentPath = {
    cv: 'CVs',
    profile: 'profile',
    'contact-profile': 'contacts-profiles',
    'company-logo': 'companies-logos',
    'room-gallery': 'rooms-galleries',
    'room-image': 'rooms-images',
    'blog-image': 'blogs-images',
    'destination-image': 'destinations-images',
    'dish-image': 'dishes-images',
    'csv-data': 'data-csv',
    'text-data': 'data-text',
  };

  constructor() {}
}
