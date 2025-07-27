import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsMongoId,
  ValidateIf,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Trim } from 'class-sanitizer';
import { FolderAccessibility } from '../../enums/folders/folder-accessibility.enum';

export class PatchFolderQueryDto {
  @ApiPropertyOptional({
    description: 'New name for the folder.',
    example: 'Project Documents Q4',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  @Trim()
  @MaxLength(255, { message: 'Name cannot exceed 255 characters.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Folder note' })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiPropertyOptional({
    enum: FolderAccessibility,
    description: 'Accessibility: PRIVATE, PUBLIC, or PROTECTED',
  })
  @IsOptional()
  @IsEnum(FolderAccessibility)
  accessibility?: FolderAccessibility;

  @ApiPropertyOptional({
    description: 'Password for protected folders (min length 6)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'Access password must be at least 6 characters long.',
  })
  accessPassword?: string;

  @ApiPropertyOptional({
    description:
      'ID of the new parent folder. Send `null` to move the folder to the root level.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsMongoId({
    message: 'parentId must be a valid MongoDB ObjectId string or null.',
  })
  parentId?: string | null;
}
