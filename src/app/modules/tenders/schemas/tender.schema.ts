import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/app/shared/enums/status.enum';

export type TenderDocument = Tender & Document;

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
export class Tender {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ required: true })
  location: string;

  // key value pair
  @Prop({ type: Map, of: String, required: true })
  submissionInstructions: Map<string, string>;

  @Prop({ type: [String], default: [] })
  documents: string[];

  @Prop({ required: true })
  submissionDeadline: Date;

  @Prop({
    required: true,
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @Prop({
    type: {
      description: { type: String, required: true },
      objectives: { type: [String], default: [] },
      requirements: { type: [String], default: [] },
      deliverables: { type: [String], default: [] },
      timeline: { type: String },
      estimatedBudget: { type: String },
      additionalInfo: { type: Map, of: String, default: {} },
    },
    required: true,
  })
  projectOverview: {
    description: string;
    objectives: string[];
    requirements: string[];
    deliverables: string[];
    timeline?: string;
    estimatedBudget?: string;
    additionalInfo?: Map<string, string>;
  };

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({
    type: {
      metaTags: {
        title: String,
        description: String,
        keywords: [String],
        canonicalUrl: String,
        robots: String,
        author: String,
        language: String,
      },
      socialTags: {
        ogTitle: String,
        ogDescription: String,
        ogImage: String,
        ogType: String,
        ogUrl: String,
        ogSiteName: String,
        ogLocale: String,
        twitterCard: String,
        twitterTitle: String,
        twitterDescription: String,
        twitterImage: String,
        twitterSite: String,
        twitterCreator: String,
      },
      structuredData: Object,
      breadcrumbs: [{
        name: String,
        url: String,
        position: Number,
      }],
      alternateLanguages: Object,
    },
    default: {},
  })
  seo: {
    metaTags: {
      title: string;
      description: string;
      keywords: string[];
      canonicalUrl: string;
      robots: string;
      author?: string;
      language?: string;
    };
    socialTags: {
      ogTitle: string;
      ogDescription: string;
      ogImage: string;
      ogType: string;
      ogUrl: string;
      ogSiteName?: string;
      ogLocale?: string;
      twitterCard: string;
      twitterTitle: string;
      twitterDescription: string;
      twitterImage: string;
      twitterSite?: string;
      twitterCreator?: string;
    };
    structuredData?: object;
    breadcrumbs?: Array<{
      name: string;
      url: string;
      position: number;
    }>;
    alternateLanguages?: Record<string, string>;
  };
}

export const TenderSchema = SchemaFactory.createForClass(Tender);
