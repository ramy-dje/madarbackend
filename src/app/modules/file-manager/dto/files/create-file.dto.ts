import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsMongoId,
  IsArray,
  ArrayMaxSize,
  MaxLength,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { EntityType } from '../../enums/entity-type.enum';
import { FilePermission } from '../../enums/file-permission.enum';
import { ShareRoleDto } from '../folders/role-share.dto';

export class SharePermissionInputDto {
  @ApiProperty({
    description: 'ID of the user/principal being shared with.',
    example: '605c72...',
  })
  @IsNotEmpty({ message: 'Principal ID is required within a share object.' })
  @IsMongoId({ message: 'Principal ID must be a valid MongoDB ObjectId.' })
  principalId: string;

  @ApiProperty({
    description: 'Type of the user/app being shared with.',
    enum: EntityType,
    example: EntityType.HOTEL_USER,
  })
  @IsNotEmpty({ message: 'Principal type is required within a share object.' })
  principalType: EntityType; // Stores Type of the user/app (e.g., HOTEL_USER)

  @ApiProperty({
    description: 'Permission level granted.',
    enum: FilePermission,
    example: FilePermission.READ,
  })
  @IsNotEmpty({ message: 'Permission is required within a share object.' })
  @IsEnum(FilePermission, {
    message: `Permission must be one of: ${Object.values(FilePermission).join(', ')}`,
  })
  permission: FilePermission;
}

export class CreateFileDto {
  @ApiPropertyOptional({
    description:
      'ID of the parent folder where the file will be stored. Send "null" or omit for root.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined && v !== 'null')
  @IsMongoId({ message: 'folderId must be a valid MongoDB ObjectId string.' })
  @IsString()
  folderId?: string | null;

  @ApiProperty({
    description: 'alt text for the file.',
    example: 'Invoice for Q1 2023',
    type: String,
  })
  @IsOptional()
  altText?: string | null;

  @ApiPropertyOptional({
    description: 'Tags associated with the file.',
    type: [String],
    maxItems: 20,
    example: ['invoice', 'q1'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'List of users/principals to share the file with initially.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  sharedWith?: SharePermissionInputDto[];

  @ApiPropertyOptional({
    description: 'List of roles to share the file with initially.',
    type: () => [ShareRoleDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  sharedWithRoles?: ShareRoleDto[];
}
