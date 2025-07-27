import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from 'src/core/dto/pagination-query.dto';

export enum ServiceLanguage {
  AR = 'ar',
  FR = 'fr',
  EN = 'en',
}

export enum ServiceSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  STATUS = 'status',
}

export enum ServiceSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ServiceQueryDto extends PaginationQueryDto {
  // Search and text filtering
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  // Category filtering
  @IsOptional()
  @IsString()
  categorySlugs?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  categories?: string[];

  // Tag filtering
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  tags?: string[];

  // Feature filtering
  @IsOptional()
  @IsString()
  featureCategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  featureCategories?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasHighlightedFeatures?: boolean;

  // Status and visibility
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  statuses?: string[];

  // Author filtering
  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  authorIds?: string[];

  // Language filtering
  @IsOptional()
  @IsEnum(ServiceLanguage)
  language?: ServiceLanguage;

  @IsOptional()
  @IsArray()
  @IsEnum(ServiceLanguage, { each: true })
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  languages?: ServiceLanguage[];

  // Date filtering
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @IsOptional()
  @IsString()
  createdBefore?: string;

  @IsOptional()
  @IsString()
  updatedAfter?: string;

  @IsOptional()
  @IsString()
  updatedBefore?: string;



  // Sorting
  @IsOptional()
  @IsEnum(ServiceSortBy)
  sortBy?: ServiceSortBy = ServiceSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(ServiceSortOrder)
  sortOrder?: ServiceSortOrder = ServiceSortOrder.DESC;

  // Content filtering
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasMedia?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasDocument?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasFeatures?: boolean;

  // SEO filtering
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasSeoData?: boolean;
} 