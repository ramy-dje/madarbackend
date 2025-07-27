import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/core/dto/pagination-query.dto';
import { TagType } from 'src/app/shared/enums/tag-type.enum';

export class TagQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(TagType)
  type?: TagType;
} 