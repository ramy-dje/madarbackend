import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeoService } from './services/seo.service';
import { SlugService } from './services/slug.service';

@Module({
  imports: [ConfigModule],
  providers: [SeoService, SlugService],
  exports: [SeoService, SlugService],
})
export class SeoModule {} 