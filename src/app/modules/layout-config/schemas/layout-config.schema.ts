import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LayoutType, DisplayStyle, NavigationStyle } from '../../../shared/enums/layout-type.enum';

@Schema({ _id: false })
export class WidgetConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;
}

@Schema({ _id: false })
export class SidebarConfig {
  @Prop([WidgetConfig])
  widgets: WidgetConfig[];

  @Prop({ required: true, enum: ['left', 'right'] })
  position: 'left' | 'right';

  @Prop()
  width?: string;

  @Prop({ default: false })
  sticky?: boolean;

  @Prop({ default: true })
  showOnMobile?: boolean;
}

@Schema({ _id: false })
export class LayoutConfigData {
  @Prop({ required: true, enum: LayoutType })
  layoutType: LayoutType;

  @Prop({ enum: DisplayStyle })
  displayStyle?: DisplayStyle;

  @Prop({ enum: NavigationStyle })
  navigationStyle?: NavigationStyle;

  @Prop({ type: SidebarConfig })
  sidebar?: SidebarConfig;

  @Prop()
  customCSS?: string;

  @Prop()
  customJS?: string;
}

@Schema({ _id: false })
export class ContentTypeLayoutConfig {
  @Prop({ required: true })
  contentType: string;

  @Prop({ type: LayoutConfigData, required: true })
  layout: LayoutConfigData;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class LayoutConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop([ContentTypeLayoutConfig])
  contentTypes: ContentTypeLayoutConfig[];

  @Prop({ required: true, default: false })
  isDefault: boolean;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  author: Types.ObjectId;
}

export const LayoutConfigSchema = SchemaFactory.createForClass(LayoutConfig); 