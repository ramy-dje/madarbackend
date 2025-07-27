import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { SitemapService } from './sitemap.service';
import { SeoService } from 'src/core/services/seo.service';

@Controller('v1/seo')
export class SeoController {
  constructor(
    private readonly seoService: SeoService,
    private readonly sitemapService: SitemapService,
  ) {}

  /**
   * Generate and serve robots.txt
   */
  @Get('robots.txt')
  @Public()
  @Header('Content-Type', 'text/plain')
  getRobotsTxt(): string {
    const config = this.seoService.getSeoConfig();
    return config.robotsTxt;
  }

  /**
   * Generate and serve XML sitemap
   */
  @Get('sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  async getSitemapXml(@Res() res: Response): Promise<void> {
    try {
      const sitemapData = await this.sitemapService.generateSitemap();
      const xml = this.sitemapService.convertToXml(sitemapData);
      
      res.status(HttpStatus.OK).send(xml);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating sitemap');
    }
  }

  /**
   * Generate sitemap for specific content type
   */
  @Get('sitemap/:type.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  async getSitemapByType(
    @Query('type') type: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const sitemapData = await this.sitemapService.generateSitemapByType(type);
      const xml = this.sitemapService.convertToXml(sitemapData);
      
      res.status(HttpStatus.OK).send(xml);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating sitemap');
    }
  }

  /**
   * Get SEO configuration
   */
  @Get('config')
  @Public()
  getSeoConfig() {
    return this.seoService.getSeoConfig();
  }

  /**
   * Validate SEO data for content
   */
  @Get('validate')
  @Public()
  validateSeoData(@Query('content') content: string) {
    try {
      const contentData = JSON.parse(content);
      const seoData = this.seoService.generateSeoData(contentData, {
        type: contentData.type || 'page',
        slug: contentData.slug,
      });
      
      return this.seoService.validateSeoData(seoData);
    } catch (error) {
      throw new NotFoundException('Invalid content data');
    }
  }
} 