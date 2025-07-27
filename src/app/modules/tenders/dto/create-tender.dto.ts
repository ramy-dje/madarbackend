import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';

export class ProjectOverviewDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @IsString()
  @IsOptional()
  timeline?: string;

  @IsString()
  @IsOptional()
  estimatedBudget?: string;

  @IsOptional()
  additionalInfo?: Record<string, string>;
}

export class CreateTenderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: Types.ObjectId[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsObject()
  @IsNotEmpty()
  submissionInstructions: Record<string, string>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];

  @IsDate()
  @IsNotEmpty()
  submissionDeadline: Date;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ValidateNested()
  @Type(() => ProjectOverviewDto)
  @IsNotEmpty()
  projectOverview: ProjectOverviewDto;

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
