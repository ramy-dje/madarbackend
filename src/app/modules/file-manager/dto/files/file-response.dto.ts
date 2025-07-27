import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '../../enums/file-type.enum';

/**
 * Represents basic file information for listing purposes.
 */
export class FileResponseDto {
  @ApiProperty({ example: '605c73...', description: 'File ID' })
  id: string;

  @ApiProperty({
    example: 'Annual Report Q1.pdf',
    description: 'User-facing file name',
  })
  originalname: string;

  @ApiProperty({ example: 'application/pdf', description: 'File MIME type' })
  mimetype: string;

  @ApiProperty({ example: 1048576, description: 'File size in bytes' })
  size: number;

  @ApiProperty({
    example: 'document',
    description: 'File type category',
    enum: FileType,
  })
  type: FileType;

  @ApiPropertyOptional({
    description: 'Indicates if the file is currently locked',
  })
  isLocked?: boolean;

  @ApiProperty({
    example: '605c73a4b3f8a74a5b6f3c9e',
    description: 'ID of the folder containing this file',
  })
  folderId: string | null;

  @ApiProperty({
    description: 'Timestamp when the file was created',
    example: '2023-10-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the file was last updated',
    example: '2023-10-01T12:00:00Z',
  })
  updatedAt: Date;
}
