import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { FolderResponseDto } from '../folder-response.dto';
import { FileResponseDto } from '../../files/file-response.dto';

/**
 * Represents pagination metadata included in paginated responses.
 */
export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number.' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page.' })
  size: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of items matching the query.',
  })
  totalItems: number;

  @ApiProperty({ example: 3, description: 'Total number of pages available.' })
  totalPages: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if there are more pages available.',
  })
  hasMore: boolean;
}

/**
 * Defines the response structure for browsing directory contents (folders and files).
 */
export class BrowseResponseDto {
  @ApiProperty({
    type: [FolderResponseDto],
    description: 'List of folders found on the current page.',
  })
  @ValidateNested({ each: true })
  @Type(() => FolderResponseDto)
  folders: FolderResponseDto[];

  @ApiProperty({
    type: [FileResponseDto],
    description: 'List of files found on the current page.',
  })
  @ValidateNested({ each: true })
  @Type(() => FileResponseDto)
  files: FileResponseDto[];

  @ApiProperty({ description: 'Pagination metadata.' })
  @ValidateNested()
  @Type(() => PaginationMeta)
  pagination: PaginationMeta;
}
