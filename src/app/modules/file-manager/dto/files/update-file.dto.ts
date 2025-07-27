import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originalname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  sharedWith?: Array<{
    userId: string;
    permission: 'read' | 'write' | 'admin';
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Type(() => Boolean)
  lock?: boolean;
}
