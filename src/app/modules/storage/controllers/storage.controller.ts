import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { StorageUploadImageInterface } from '../interfaces/upload-image.interface';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { UploadImageValidationSchema } from '../validations/upload-image.schema';
import { DeleteImageValidationSchema } from '../validations/delete-image.schema';
import { UploadFileValidationSchema } from '../validations/upload-file.schema';
import { StorageUploadFileInterface } from '../interfaces/upload-file.interface';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthRole } from '../../auth/guards/role.guard';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  // upload image
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(UploadImageValidationSchema))
  @Post('upload-image-preassigned')
  async uploadImagePreassignedURL(@Body() body: StorageUploadImageInterface) {
    return await this.storageService.generatePresignedImageURL(body);
  }

  // upload file
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(UploadFileValidationSchema))
  @Post('upload-file-preassigned')
  async uploadFilePreassignedURL(@Body() body: StorageUploadFileInterface) {
    return await this.storageService.generatePresignedFileURL(body);
  }

  // delete image
  @UseGuards(AuthGuard, AuthRole([], []))
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(DeleteImageValidationSchema))
  @Delete('image')
  async deleteImage(@Body() body: { public_url: string }): Promise<string> {
    await this.storageService.deleteObjectByPublicURL(body.public_url);
    return 'Deleted Successfully';
  }
}
