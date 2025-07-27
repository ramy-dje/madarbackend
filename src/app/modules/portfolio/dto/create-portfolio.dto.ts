import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';

// Custom validator for multilingual content
function validateMultilingualContent(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  const { ar, fr, en } = value;
  return !!(ar || fr || en);
}

class MultilingualContentDto {
  @IsString()
  @IsOptional()
  ar?: string;

  @IsString()
  @IsOptional()
  fr?: string;

  @IsString()
  @IsOptional()
  en?: string;
}

class PortfolioFeatureDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreatePortfolioDto {
  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @Validate(validateMultilingualContent, {
    message: 'At least one language (ar, fr, or en) must be provided for title'
  })
  title: MultilingualContentDto;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: Types.ObjectId[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tags?: Types.ObjectId[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media?: string[];

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @IsOptional()
  summary?: MultilingualContentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioFeatureDto)
  @IsOptional()
  features?: PortfolioFeatureDto[];

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @Validate(validateMultilingualContent, {
    message: 'At least one language (ar, fr, or en) must be provided for content'
  })
  content: MultilingualContentDto;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsOptional()
  seo?: {
    metaTags?: {
      title?: string;
      description?: string;
      keywords?: string[];
      canonicalUrl?: string;
      robots?: string;
      author?: string;
      language?: string;
    };
    socialTags?: {
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      ogType?: string;
      ogUrl?: string;
      ogSiteName?: string;
      ogLocale?: string;
      twitterCard?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string;
      twitterSite?: string;
      twitterCreator?: string;
    };
    structuredData?: object;
    breadcrumbs?: Array<{
      name: string;
      url: string;
      position: number;
    }>;
    alternateLanguages?: Record<string, string>;
  };

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
