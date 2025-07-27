import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WidgetType } from '../../../shared/enums/layout-type.enum';

@Schema({ timestamps: true })
export class Widget extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: WidgetType })
  type: WidgetType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author?: Types.ObjectId;
}

export const WidgetSchema = SchemaFactory.createForClass(Widget); 