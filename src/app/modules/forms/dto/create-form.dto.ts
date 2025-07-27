import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, FieldWidth } from '../schemas/form.schema';
import { Types } from 'mongoose';

export class ValidationRuleDto {
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;

  @IsOptional()
  minLength?: number;

  @IsOptional()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  url?: boolean;

  @IsOptional()
  @IsArray()
  allowedExtensions?: string[];

  @IsOptional()
  maxFileSize?: number;

  @IsOptional()
  @IsString()
  custom?: string;
}

export class FieldOptionDto {
  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}

export class FormFieldDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  helpText?: string;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationRuleDto)
  validation?: ValidationRuleDto;

  @IsOptional()
  @IsEnum(FieldWidth)
  width?: FieldWidth;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  options?: FieldOptionDto[];

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  order?: number;

  @IsOptional()
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };

  @IsOptional()
  attributes?: Record<string, any>;
}

export class CreateFormDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  successMessage?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  settings?: {
    allowMultipleSubmissions?: boolean;
    requireAuthentication?: boolean;
    enableCaptcha?: boolean;
    enableNotifications?: boolean;
    notificationEmail?: string;
    saveSubmissions?: boolean;
  };

}