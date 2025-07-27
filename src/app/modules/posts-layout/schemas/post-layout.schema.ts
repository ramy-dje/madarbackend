import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enums
export enum LayoutType {
  RIGHT_SIDEBAR = 'right-sidebar',
  LEFT_SIDEBAR = 'left-sidebar',
  FULL_WIDTH = 'full-width',
}

export enum DisplayType {
  GRID = 'grid',
  LIST = 'list',
  MASONRY = 'masonry',
}

export enum NavigationType {
  PAGINATION = 'pagination',
  INFINITE_SCROLL = 'infinite-scroll',
}

export type PostLayoutDocument = PostLayout & Document;

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
export class PostLayout {
  @Prop({ required: true, enum: LayoutType })
  layoutType: LayoutType;

  @Prop({ required: true, enum: DisplayType })
  displayType: DisplayType;

  @Prop({ required: true, enum: NavigationType })
  navigationType: NavigationType;

  @Prop({ required: true })
  sidebarWidgets: string[]; // categories, tags, search

  @Prop({ required: true })
  gridColumns: number; // 1, 2, 3, 4
}

export const PostLayoutSchema = SchemaFactory.createForClass(PostLayout);
