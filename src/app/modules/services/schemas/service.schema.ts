import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../../../shared/enums/status.enum';
import { Feature, MultilingualContent } from '../interfaces/feature.interface';

export type ServiceDocument = Service & Document;

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
export class Service {
  @Prop({ type: { ar: String, fr: String, en: String }, required: true, _id: false })
  title: MultilingualContent;

  @Prop({
    type: [{
      title: {
        ar: { type: String, required: false },
        fr: { type: String, required: false },
        en: { type: String, required: false }
      },
      description: {
        ar: { type: String, required: false },
        fr: { type: String, required: false },
        en: { type: String, required: false }
      },
      icon: { type: String, required: false },
      category: { type: String, required: false },
      isHighlighted: { type: Boolean, default: false },
      order: { type: Number, default: 0 }
    }],
    default: []
  })
  features: Feature[];

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop()
  document: string;

  @Prop({ type: { ar: String, fr: String, en: String }, required: true, _id: false })
  content: MultilingualContent;

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

  @Prop({
    required: true,
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author?: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
