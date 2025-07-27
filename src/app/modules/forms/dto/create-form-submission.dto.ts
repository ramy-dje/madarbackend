// dto/create-form-submission.dto.ts
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateFormSubmissionDto {
  @IsString()
  formId: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}