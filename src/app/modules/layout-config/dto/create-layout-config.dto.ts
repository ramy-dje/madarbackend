import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { LayoutType, DisplayStyle, NavigationStyle, WidgetType } from '../../../shared/enums/layout-type.enum';

export class WidgetConfigDto {
  @IsString()
  id: string;

  @IsEnum(WidgetType)
  type: WidgetType;

  @IsString()
  title: string;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class SidebarConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetConfigDto)
  widgets: WidgetConfigDto[];

  @IsEnum(['left', 'right'])
  position: 'left' | 'right';

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsBoolean()
  sticky?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnMobile?: boolean;
}

export class LayoutConfigDto {
  @IsEnum(LayoutType)
  layoutType: LayoutType;

  @IsOptional()
  @IsEnum(DisplayStyle)
  displayStyle?: DisplayStyle;

  @IsOptional()
  @IsEnum(NavigationStyle)
  navigationStyle?: NavigationStyle;

  @IsOptional()
  @ValidateNested()
  @Type(() => SidebarConfigDto)
  sidebar?: SidebarConfigDto;

  @IsOptional()
  @IsString()
  customCSS?: string;

  @IsOptional()
  @IsString()
  customJS?: string;
}

export class ContentTypeLayoutConfigDto {
  @IsString()
  contentType: string;

  @ValidateNested()
  @Type(() => LayoutConfigDto)
  layout: LayoutConfigDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateLayoutConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentTypeLayoutConfigDto)
  contentTypes: ContentTypeLayoutConfigDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 