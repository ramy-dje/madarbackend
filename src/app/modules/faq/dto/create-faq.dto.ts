import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'src/app/shared/enums/status.enum';
import { Types } from 'mongoose';

class QaPairDto {
  @IsMongoId()
  @IsOptional()
  _id?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaPairDto)
  qaPairs: QaPairDto[];

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: string[];

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
}
