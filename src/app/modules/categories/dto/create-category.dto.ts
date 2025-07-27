import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';

export class CreateCategoryDto {
  @IsObject()
  @IsNotEmpty()
  name: {
    ar?: string;
    fr?: string;
    en?: string;
  };

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsMongoId()
  @IsOptional()
  parentId?: Types.ObjectId;

  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
