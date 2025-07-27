import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
  MinLength,
  IsNotEmpty,
  ArrayMaxSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FolderAccessibility } from '../../enums/folders/folder-accessibility.enum';
import { Type } from 'class-transformer';
import { SharePrincipalDto } from 'src/core/dto/shared-with.dto';
import { ShareRoleDto } from './role-share.dto';

export class CreateFolderDto {
  @ApiProperty({ description: 'Folder name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Folder note' })
  @IsOptional()
  @IsString()
  note: string | null;

  @ApiPropertyOptional({ description: 'Parent folder ID' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiProperty({
    enum: FolderAccessibility,
    description: 'Accessibility: PRIVATE, PUBLIC, or PROTECTED',
  })
  @IsEnum(FolderAccessibility)
  accessibility: FolderAccessibility;

  @ApiPropertyOptional({
    description: 'Password for protected folders (min length 6)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  accessPassword?: string;

  @ApiPropertyOptional({
    description: 'Share with specific users',
    type: () => [SharePrincipalDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SharePrincipalDto)
  sharedWith?: SharePrincipalDto[];

  @ApiPropertyOptional({
    description: 'Share with roles',
    type: () => [ShareRoleDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ShareRoleDto)
  sharedWithRoles?: ShareRoleDto[];
}
