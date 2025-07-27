import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  ValidateNested,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';
import { Feature, MultilingualContent } from '../interfaces/feature.interface';

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

export class FeatureDto {
  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @Validate(validateMultilingualContent, {
    message: 'At least one language (ar, fr, or en) must be provided for title'
  })
  title: MultilingualContent;

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @IsOptional()
  description?: MultilingualContent;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateServiceDto {
  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @Validate(validateMultilingualContent, {
    message: 'At least one language (ar, fr, or en) must be provided for title'
  })
  title: MultilingualContent;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  @IsOptional()
  features?: Feature[];

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

  @IsString()
  @IsOptional()
  document?: string;

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  @Validate(validateMultilingualContent, {
    message: 'At least one language (ar, fr, or en) must be provided for content'
  })
  content: MultilingualContent;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsObject()
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
