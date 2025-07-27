import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Form', required: true })
  formId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;

  @Prop()
  userAgent?: string;

  @Prop()
  ipAddress?: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  userId?: Types.ObjectId;

  @Prop({ default: 'submitted' })
  status: 'submitted' | 'reviewed' | 'processed' | 'archived';

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);