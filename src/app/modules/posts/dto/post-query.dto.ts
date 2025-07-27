import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from 'src/core/dto/pagination-query.dto';
import { PostType } from '../../../shared/enums/post-type.enum';
import { Status } from '../../../shared/enums/status.enum';

export enum PostLanguage {
  AR = 'ar',
  FR = 'fr',
  EN = 'en',
}

export class PostQueryDto extends PaginationQueryDto {
  // Search functionality
  @IsOptional()
  @IsString()
  search?: string;

  // Post type filtering (comma-separated)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(type => type.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsEnum(PostType, { each: true })
  types?: PostType[];

  // Status filtering (comma-separated)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(status => status.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsEnum(Status, { each: true })
  statuses?: Status[];

  // Category filtering (by IDs) - comma-separated
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString()
  categoryIds?: string; // Comma-separated IDs

  // Tag filtering (by IDs) - comma-separated
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString()
  tagIds?: string; // Comma-separated IDs

  // Author filtering (comma-separated)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsString({ each: true })
  authorIds?: string[];

  // Language filtering (comma-separated)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(lang => lang.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsEnum(PostLanguage, { each: true })
  languages?: PostLanguage[];

  // Event-specific filtering (comma-separated)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(loc => loc.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsString({ each: true })
  locations?: string[];
}
