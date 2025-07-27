import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TagType } from 'src/app/shared/enums/tag-type.enum';

export type TagDocument = Tag & Document;

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
export class Tag {
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

  @Prop({ default: '#3B82F6' })
  color?: string;

  @Prop({ default: false })
  isActive?: boolean;

  @Prop({ required: true, enum: TagType })
  type: TagType;
}

export const TagSchema = SchemaFactory.createForClass(Tag); 