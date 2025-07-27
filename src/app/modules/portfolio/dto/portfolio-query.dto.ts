import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum PortfolioLanguage {
  AR = 'ar',
  FR = 'fr',
  EN = 'en',
}

export class PortfolioQueryDto {
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
  tagIds?: string;

  @IsOptional()
  @IsString()
  tagSlugs?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(PortfolioLanguage)
  language?: PortfolioLanguage;
} 