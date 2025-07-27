import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FaqQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryIds?: string;

  @IsOptional()
  @IsString()
  categorySlugs?: string;

  @IsOptional()
  @IsString()
  status?: string;
} 