import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsMongoId,
  ValidateIf,
  IsDate,
  IsEnum,
} from 'class-validator';
import { FileType } from '../../../enums/file-type.enum';
import { PaginationQueryDto } from '../../pagination-query.dto';
export enum BrowseItemTypeFilter {
  ALL = 'all',
  FOLDERS = 'folders',
  FILES = 'files',
}

export class BrowseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'ID of the parent folder to browse. Omit or send the literal string "null" to browse the root directory.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== 'null')
  @IsMongoId({ message: 'parentId must be a valid MongoDB ObjectId string.' })
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description:
      'Search term to filter folders and files by name (case-insensitive).',
    example: 'Invoice',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by item type.',
    enum: BrowseItemTypeFilter,
    default: BrowseItemTypeFilter.ALL,
    example: BrowseItemTypeFilter.FILES,
  })
  @IsOptional()
  @IsEnum(BrowseItemTypeFilter, {
    message: `itemType must be one of: ${Object.values(BrowseItemTypeFilter).join(', ')}`,
  })
  itemType?: BrowseItemTypeFilter = BrowseItemTypeFilter.ALL;

  @ApiPropertyOptional({
    description: 'Filter files by specific file type categories .',
    enum: FileType,
    isArray: true,
    example: ['pdf', 'document'],
  })
  @IsOptional()
  fileTypes?: FileType[];

  @ApiPropertyOptional({
    description:
      'Filter by creation start date (inclusive). Format: YYYY-MM-DD or ISO date string.',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid date.' })
  startDate?: Date;

  @ApiPropertyOptional({
    description:
      'Filter by creation end date (inclusive). Format: YYYY-MM-DD or ISO date string.',
    example: '2024-03-31',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid date.' })
  endDate?: Date;

  @ApiPropertyOptional({
    description:
      'Shared with me filter. If true, only show items shared with the user.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  sharedWithMe?: boolean;

  @ApiPropertyOptional({
    description:
      'filter by owner id. If provided, only show items owned by this user.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== 'null')
  @IsMongoId({ message: 'ownerId must be a valid MongoDB ObjectId string.' })
  @IsString()
  ownerId?: string;
}
