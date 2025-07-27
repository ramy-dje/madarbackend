import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { StorageUploadImageInterface } from '../interfaces/upload-image.interface';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { StorageUploadFileInterface } from '../interfaces/upload-file.interface';
import { CoreService } from 'src/core/services/core.service';

@Injectable()
export class StorageService {
  constructor(
    private s3Service: S3Service,
    @Inject(CoreService) private readonly coreService: CoreService,
  ) {}

  // generate presigned url for image
  async generatePresignedImageURL(
    payload: StorageUploadImageInterface,
  ): Promise<{
    public_url: string;
    preassigned_url: string;
  }> {
    const { size, type } = payload;

    // Verifying
    // size is under the size limit
    if (size > this.s3Service.Image_Size_Limit) {
      throw new HttpException(
        'File Size Is More Then 5MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { key, pubUrl } = this.generatePublicURL(payload, 'image');

    // create the putObjectCommand
    const putObjectCommand = new PutObjectCommand({
      ContentType: type, // image type
      Key: key, // key
      Bucket: this.s3Service.Bucket, // bucket
    });

    try {
      // create the preassigned url
      const preassigned_url = await getSignedUrl(
        this.s3Service.S3_Client,
        putObjectCommand,
        { expiresIn: 3600 },
      );

      return {
        preassigned_url,
        public_url: pubUrl,
      };
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // generate presigned url for a file
  async generatePresignedFileURL(payload: StorageUploadFileInterface): Promise<{
    public_url: string;
    preassigned_url: string;
  }> {
    const { size, type } = payload;

    // Verifying
    // size is under the size limit
    if (size > this.s3Service.File_Size_Limit) {
      throw new HttpException(
        'File Size Is More Then 10MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { key, pubUrl } = this.generatePublicURL(payload, 'file');

    // create the putObjectCommand
    const putObjectCommand = new PutObjectCommand({
      ContentType: type, // file type
      Key: key, // key
      Bucket: this.s3Service.Bucket, // bucket
    });

    try {
      // create the preassigned url
      const preassigned_url = await getSignedUrl(
        this.s3Service.S3_Client,
        putObjectCommand,
        { expiresIn: 3600 },
      );

      return {
        preassigned_url,
        public_url: pubUrl,
      };
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // deleteObjectByPublicURL
  async deleteObjectByPublicURL(public_url: string) {
    // check if url is valid
    if (!this.coreService.IsValidURL(public_url)) return;
    // get the key from the public url
    const key = this.getObjectKeyFromPublicURL(public_url);
    // create the deleteObjectCommand
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.s3Service.Bucket,
      Key: key,
    });
    try {
      // delete the object
      await this.s3Service.S3_Client.send(deleteObjectCommand);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete manyObjectURLs
  async deleteManyObjectsByPublicURLs(public_urls: string[]) {
    // delete many files
    try {
      for (let idx = 0; idx < public_urls.length; idx++) {
        // access the url
        const url = public_urls[idx];
        // delete the url
        if (url) {
          // use the delete url method
          await this.deleteObjectByPublicURL(url);
        }
      }
    } catch (err) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // #PRIVATE METHODS

  // generate a public url
  private generatePublicURL(
    payload: StorageUploadImageInterface | StorageUploadFileInterface,
    upload_type: 'image' | 'file',
  ): {
    key: string;
    pubUrl: string;
  } {
    // image type
    const type = this.s3Service.ContentPath[payload.usage] || 'other';

    const nanoId = nanoid(20);

    const path_key =
      upload_type == 'image'
        ? this.s3Service.Image_Key
        : this.s3Service.File_Key;

    const key = `${path_key}/${type}/${nanoId}`;

    // url
    const url = `${this.s3Service.Public_URL}/${path_key}/${type}/${nanoId}`;

    return { key, pubUrl: url };
  }

  // get object key from public url
  private getObjectKeyFromPublicURL(publicURL: string): string {
    const url = new URL(publicURL);
    // remove the starting '/' form the pathname
    return url.pathname.substring(1);
  }
}
