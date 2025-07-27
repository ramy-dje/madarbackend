import { Types } from 'mongoose';
import { LayoutType, DisplayStyle, NavigationStyle, WidgetType } from '../enums/layout-type.enum';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  active: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SidebarConfig {
  widgets: WidgetConfig[];
  position: 'left' | 'right';
  width?: string; // CSS width value (e.g., '300px', '25%')
  sticky?: boolean;
  showOnMobile?: boolean;
}

export interface LayoutConfig {
  layoutType: LayoutType;
  displayStyle?: DisplayStyle;
  navigationStyle?: NavigationStyle;
  sidebar?: SidebarConfig;
  customCSS?: string;
  customJS?: string;
}

export interface ContentTypeLayoutConfig {
  contentType: string;
  layout: LayoutConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalLayoutConfig {
  id: string;
  name: string;
  description?: string;
  contentTypes: ContentTypeLayoutConfig[];
  isDefault: boolean;
  isActive: boolean;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutPreviewData {
  contentType: string;
  layoutType: LayoutType;
  displayStyle?: DisplayStyle;
  navigationStyle?: NavigationStyle;
  hasSidebar: boolean;
  sidebarPosition?: 'left' | 'right';
  widgetCount: number;
}

export interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  defaultSettings: Record<string, any>;
  icon?: string;
  category: 'content' | 'navigation' | 'social' | 'utility' | 'custom';
} 