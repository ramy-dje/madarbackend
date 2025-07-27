import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';

export type CategoryDocument = Category & Document;

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
export class Category {
  @Prop({ required: true, type: Object })
  name: {
    ar?: string;
    fr?: string;
    en?: string;
  };

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  coverImage?: string;

  @Prop()
  thumbnail?: string;

  @Prop()
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  parentId?: Types.ObjectId;

  @Prop({ required: true, enum: CategoryType })
  type: CategoryType;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
