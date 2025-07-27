import { IsOptional, IsString } from 'class-validator';

export class TenderQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryIds?: string;

  @IsOptional()
  @IsString()
  categorySlugs?: string;

  @IsOptional()
  @IsString()
  tagIds?: string;
} 