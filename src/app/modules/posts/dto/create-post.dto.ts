import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Status } from '../../../shared/enums/status.enum';
import { PostType } from '../../../shared/enums/post-type.enum';

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

export class CreatePostDto {
  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType;

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  title: MultilingualContentDto;

  @ValidateNested()
  @Type(() => MultilingualContentDto)
  content: MultilingualContentDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media?: string[];

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  heroImage?: string;

  @IsMongoId()
  @IsOptional()
  category?: Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: Types.ObjectId[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tags?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  showComments?: boolean;

  @IsBoolean()
  @IsOptional()
  readabilityEnabled?: boolean;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ValidateIf((o) => o.type === PostType.EVENT)
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate?: Date;

  @ValidateIf((o) => o.type === PostType.EVENT)
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate?: Date;

  @ValidateIf((o) => o.type === PostType.EVENT)
  @IsString()
  @IsOptional()
  location?: string;

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
