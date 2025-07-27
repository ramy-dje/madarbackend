import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { EntityType } from 'src/app/modules/file-manager/enums/entity-type.enum';
import { FilePermission } from 'src/app/modules/file-manager/enums/file-permission.enum';

export class SharePrincipalDto {
  @ApiProperty({
    description:
      'ID of the principal (User, Application, etc.) being shared with.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
  })
  @IsNotEmpty({ message: 'Principal ID cannot be empty.' })
  @IsString({ message: 'Principal ID must be a string.' })
  principalId: string;

  @ApiProperty({
    description: 'The type of the principal being shared with.',
    enum: EntityType,
    example: EntityType.HOTEL_USER,
    default: EntityType.HOTEL_USER,
  })
  @IsNotEmpty({ message: 'Principal type is required.' })
  @IsEnum(EntityType, {
    message: `Principal type must be one of: ${Object.values(EntityType).join(', ')}`,
  })
  principalType?: EntityType;

  @ApiProperty({
    description: 'Permission level granted to the principal.',
    enum: FilePermission,
    example: FilePermission.READ,
  })
  @IsNotEmpty({ message: 'Permission is required.' })
  @IsEnum(FilePermission, {
    message: `Permission must be one of: ${Object.values(FilePermission).join(', ')}`,
  })
  permission: FilePermission;
}

export class SharedWithDto {
  @ApiPropertyOptional({
    description:
      'Replace the entire sharing list with this array. Send empty array `[]` to remove all shares.',
    type: () => [SharePrincipalDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SharePrincipalDto)
  sharedWith?: SharePrincipalDto[];
}
