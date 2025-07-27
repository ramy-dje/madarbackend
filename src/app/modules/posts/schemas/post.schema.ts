import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../../../shared/enums/status.enum';
import { PostType } from '../../../shared/enums/post-type.enum';

export type PostDocument = Post & Document;

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
export class Post {
  @Prop({ required: true, enum: PostType })
  type: PostType;

  @Prop({
    type: {
      _id: false,
      ar: { type: String },
      fr: { type: String },
      en: { type: String },
    },
  })
  title: {
    ar?: string;
    fr?: string;
    en?: string;
  };

  @Prop({
    type: {
      _id: false,
      ar: { type: String },
      fr: { type: String },
      en: { type: String },
    },
  })
  content: {
    ar?: string;
    fr?: string;
    en?: string;
  };

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop({ type: String, default: '' })
  image: string;

  @Prop({ type: String, default: '' })
  heroImage: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  category: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];

  @Prop({ default: true })
  showComments: boolean;

  @Prop({ default: false })
  readabilityEnabled: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  author: Types.ObjectId;

  @Prop({
    required: true,
    enum: Status,
    default: Status.DRAFT,
  })
  status: Status;

  // Event
  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  location?: string;

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
      breadcrumbs: [
        {
          name: String,
          url: String,
          position: Number,
        },
      ],
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

export const PostSchema = SchemaFactory.createForClass(Post);
