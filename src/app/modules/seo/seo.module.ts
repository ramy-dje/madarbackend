import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoController } from './seo.controller';
import { SitemapService } from './sitemap.service';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Portfolio, PortfolioSchema } from '../portfolio/schemas/portfolio.schema';
import { Faq, FaqSchema } from '../faq/schemas/faq.schema';
import { Tender, TenderSchema } from '../tenders/schemas/tender.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Tender.name, schema: TenderSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [SeoController],
  providers: [SitemapService],
  exports: [SitemapService],
})
export class SeoModule {} 