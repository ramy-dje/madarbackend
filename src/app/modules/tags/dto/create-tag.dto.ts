import { IsString, IsOptional, IsHexColor, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { TagType } from 'src/app/shared/enums/tag-type.enum';

export class CreateTagDto {
  @IsObject()
  name: {
    ar?: string;
    fr?: string;
    en?: string;
  };

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(TagType)
  type: TagType;
} 