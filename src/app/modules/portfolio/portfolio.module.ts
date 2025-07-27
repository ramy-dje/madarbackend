import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';
import { CoreModule } from 'src/core/core.module';
import { SlugService } from 'src/core/services/slug.service';
import { SeoService } from 'src/core/services/seo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
    ]),
    CategoriesModule,
    TagsModule,
    CoreModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, SlugService, SeoService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
