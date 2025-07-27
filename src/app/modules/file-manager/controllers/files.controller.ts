import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  //FileTypeValidator,
  HttpStatus,
  HttpCode,
  Patch,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // Use memoryStorage
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileManagerService } from '../services/FileManagerService.service';
import { CreateFileDto } from '../dto/files/create-file.dto';
import { AuthenticatedUserRequestInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';
import { FileFilterDTO } from '../dto/files/file-filter.dto';
import { UpdateFileDto } from '../dto/files/update-file.dto';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { FileResponse } from '../interfaces/file-response.interface';
import { CreateDownloadLinkDto } from '../dto/files/create-download-link.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthRole } from '../../auth/guards/role.guard';
import { SharedWithDto } from 'src/core/dto/shared-with.dto';
import { SharedWithPermissionDto } from 'src/core/dto/shared-with-permission.dto';
import { FileFilterSlimQueryDTO } from '../dto/files/file-filter-slim.dto';

// TODO: Move to config or service if used in multiple places
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

const MAX_UPLOAD_COUNT = 10; // Max files in a single upload

@ApiTags('Files')
@ApiBearerAuth()
@Controller('v1/files')
@UseGuards(AuthGuard, AuthRole([], []))
export class FilesController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new file' })
  @ApiConsumes('multipart/form-data') // Content type for Swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        folderId: {
          type: 'string',
          format: 'mongoId',
          description: 'Optional parent folder ID (or null for root)',
          nullable: true,
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags',
          maxItems: 20,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File metadata after successful upload.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or file type/size violation.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() })) // Use memoryStorage
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        // Validate file during upload
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          // Add FileTypeValidator *if needed* - often service-level validation is sufficient
          // new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES_REGEX }),
        ],
        fileIsRequired: true, // Ensure a file is present
      }),
    )
    file: Express.Multer.File,
    // If other DTO fields come in JSON body alongside form-data, NestJS handles it.
    // If they come as form-data fields, access them via @Body() but understand they might be strings.
    @Body() createFileDto: CreateFileDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.uploadFile(file, createFileDto, req.user);
  }

  @Post('upload-multiple')
  @ApiOperation({
    summary: `Upload multiple files (up to ${MAX_UPLOAD_COUNT})`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateFileDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Array of created file metadata.',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, file type/size violation, or too many files.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_UPLOAD_COUNT, {
      storage: memoryStorage(),
      limits: {
        files: MAX_UPLOAD_COUNT,
      },
    }),
  )
  uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() createFileDto: CreateFileDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any[]> {
    return this.fileManagerService.uploadMultipleFiles(
      files,
      createFileDto,
      req.user,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List files and folders in a directory' })
  @ApiQuery({
    name: 'folderId',
    required: false,
    type: String,
    description: 'ID of the parent folder (or "null" for root)',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'name' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of files/folders.' /* Define Response DTO */,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  listFiles(
    @Req() req: AuthenticatedUserRequestInterInterface,
    @Query() fileFilterDTO: FileFilterDTO,
  ): Promise<PaginatedResponse<FileResponse>> {
    return this.fileManagerService.listFiles(fileFilterDTO, req.user);
  }

  @Get('application/slim')
  @ApiOperation({ summary: 'List files and folders in a directory (Slim)' })
  listFilesApplicationSlim(
    @Req() req: AuthenticatedUserRequestInterInterface,
    @Query() ids?: string[] | string,
  ): Promise<PaginatedResponse<any>> {
    return this.fileManagerService.listFilesApplicationSlim(req.user, ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File metadata.',
    schema: { type: 'object', properties: { file: { type: 'object' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getFileMetadata(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<FileResponse> {
    return this.fileManagerService.getFileMetadata(id, req.user);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Generate a temporary shareable download link for a file',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the file to share',
    type: String,
  })
  @ApiQuery({ type: CreateDownloadLinkDto }) // Use DTO for optional query params like expiry
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Temporary shareable download URL generated.',
    schema: { type: 'object', properties: { shareUrl: { type: 'string' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getDownloadUrl(
    @Param('id') id: string,
    @Query() query: CreateDownloadLinkDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<{ downloadUrl: string }> {
    return this.fileManagerService.getDownloadUrl(
      id,
      req.user,
      query.expiresInSeconds,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated file metadata.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  updateFile(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.updateFile(id, updateFileDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Move a file to trash (soft delete)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'File moved to trash successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 on successful deletion
  softDeleteFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.softDeleteFile(id, req.user);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete a file' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'File permanently deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDeleteFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.hardDeleteFile(id, req.user);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a file from trash' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File restored successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  restoreFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.restoreFile(id, req.user);
  }

  @Get(':id/share')
  @ApiOperation({ summary: 'Get sharing information for a file' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sharing information for the file.',
    schema: { type: 'object', properties: { shareInfo: { type: 'object' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getShareInfo(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getShareInfo(id, req.user);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a file with specific users' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiBody({ type: SharedWithDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File sharing updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  shareFile(
    @Param('id') id: string,
    @Body() sharedWithDto: { sharedWith: any[] },
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.shareFile(id, sharedWithDto, req.user);
  }

  @Patch(':id/share/:principalId')
  @ApiOperation({ summary: 'Update sharing permissions for a specific user' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiParam({
    name: 'principalId',
    type: String,
    format: 'mongoId',
    description: 'User ID to update sharing permissions for',
  })
  @ApiBody({ type: SharedWithPermissionDto })
  @ApiResponse({
    type: SharedWithDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File or user not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  updateSharingPermissions(
    @Param('id') id: string,
    @Param('principalId') principalId: string,
    @Body() sharedWithPermissionDto: SharedWithPermissionDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.updateSharingPermissions(
      id,
      principalId,
      sharedWithPermissionDto,
      req.user,
    );
  }

  @Delete(':id/share/:principalId')
  @ApiOperation({ summary: 'Remove sharing for a specific user' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiParam({
    name: 'principalId',
    type: String,
    format: 'mongoId',
    description: 'User ID to remove sharing for',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sharing removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File or user not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 on successful deletion
  removeSharing(
    @Param('id') id: string,
    @Param('principalId') principalId: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.removeSharing(id, principalId, req.user);
  }

  // --- Version Endpoints ---
  @Post(':id/versions')
  @ApiOperation({ summary: 'Upload a new version of an existing file' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID to create a new version for',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The new file content',
        },
        changeDescription: {
          type: 'string',
          description: 'Optional description of the changes',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File metadata reflecting the new version.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Original file not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or file type/size violation.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  createVersion(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          // new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES_REGEX }), // Optional
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: { changeDescription?: string }, // Extract optional description
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.createVersion(
      id,
      file,
      req.user,
      body.changeDescription,
    );
  }

  @Get(':id/versions/:versionId/url') // New endpoint for version download URL
  @ApiOperation({
    summary: 'Get a temporary download URL for a specific file version',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'File ID',
  })
  @ApiParam({
    name: 'versionId',
    type: String,
    format: 'mongoId',
    description: 'Version ID',
  }) // Adjust format if versionId isn't UUID
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'JSON object containing the download URL.',
    schema: { type: 'object', properties: { downloadUrl: { type: 'string' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File or version not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async getVersionDownloadUrl(
    @Param('id') id: string,
    @Param('versionId') versionId: string, // Adjust Pipe if needed
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<{ downloadUrl: string }> {
    return this.fileManagerService.generateVersionDownloadUrl(
      id,
      versionId,
      req.user,
    );
  }
}
