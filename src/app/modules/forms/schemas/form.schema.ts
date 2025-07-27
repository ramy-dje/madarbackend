import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';

export type FormDocument = Form & Document;

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  NUMBER = 'number',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  CHECKBOX_GROUP = 'checkbox_group',
  RADIO = 'radio',
  SELECT = 'select',
  FILE = 'file',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  URL = 'url',
  TEL = 'tel',
  RANGE = 'range',
  COLOR = 'color',
}

export enum FieldWidth {
  FULL = '100%',
  TWO_THIRDS = '67%',
  HALF = '50%',
  THIRD = '33%',
}

export class ValidationRule {
  @Prop()
  required?: boolean;

  @Prop()
  min?: number;

  @Prop()
  max?: number;

  @Prop()
  minLength?: number;

  @Prop()
  maxLength?: number;

  @Prop()
  pattern?: string;

  @Prop()
  email?: boolean;

  @Prop()
  url?: boolean;

  @Prop([String])
  allowedExtensions?: string[];

  @Prop()
  maxFileSize?: number; // in bytes

  @Prop()
  custom?: string; // custom validation rule
}

export class FieldOption {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;

  @Prop({ default: false })
  disabled?: boolean;
}

export class FormField {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: FieldType })
  type: FieldType;

  @Prop()
  label?: string;

  @Prop()
  placeholder?: string;

  @Prop()
  helpText?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  defaultValue?: any;

  @Prop({ type: ValidationRule })
  validation?: ValidationRule;

  @Prop({ enum: FieldWidth, default: FieldWidth.FULL })
  width?: FieldWidth;

  @Prop([FieldOption])
  options?: FieldOption[]; // for select, radio, checkbox groups

  @Prop({ default: false })
  disabled?: boolean;

  @Prop({ default: true })
  visible?: boolean;

  @Prop({ default: 0 })
  order?: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };

  @Prop({ type: Object })
  attributes?: Record<string, any>; // additional HTML attributes
}

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop([FormField])
  fields: FormField[];

  @Prop({ default: true })
  active: boolean;

  @Prop()
  successMessage?: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  redirectUrl?: string;

  @Prop({ type: Object })
  settings?: {
    allowMultipleSubmissions?: boolean;
    requireAuthentication?: boolean;
    enableCaptcha?: boolean;
    enableNotifications?: boolean;
    notificationEmail?: string;
    saveSubmissions?: boolean;
  };

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author?: Types.ObjectId;

  @Prop({
    required: true,
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;
}

export const FormSchema = SchemaFactory.createForClass(Form);