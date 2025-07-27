import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../../../shared/enums/status.enum';

export type ChartDocument = Chart & Document;

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
export class Chart {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  chartType: string;

  @Prop({ type: Object, required: true })
  dataSource: Record<string, any>;

  @Prop({
    required: true,
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author?: Types.ObjectId;
}

export const ChartSchema = SchemaFactory.createForClass(Chart);
