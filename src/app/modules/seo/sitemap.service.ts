import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SitemapData, SitemapUrl } from '../../../core/interfaces/seo.interface';
import { Post } from '../posts/schemas/post.schema';
import { Service } from '../services/schemas/service.schema';
import { Portfolio } from '../portfolio/schemas/portfolio.schema';
import { Faq } from '../faq/schemas/faq.schema';
import { Tender } from '../tenders/schemas/tender.schema';
import { Category } from '../categories/schemas/category.schema';
import { Status } from '../../shared/enums/status.enum';

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);

  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
    @InjectModel('Portfolio') private readonly portfolioModel: Model<Portfolio>,
    @InjectModel('Faq') private readonly faqModel: Model<Faq>,
    @InjectModel('Tender') private readonly tenderModel: Model<Tender>,
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {}

  /**
   * Generate complete sitemap for all content types
   */
  async generateSitemap(): Promise<SitemapData> {
    const urls: SitemapUrl[] = [];

    // Add static pages
    urls.push(
      {
        url: '/',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: '/about',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: '/contact',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    );

    // Add content from different types
    const [posts, services, portfolios, faqs, tenders, categories] = await Promise.all([
      this.getPublishedPosts(),
      this.getPublishedServices(),
      this.getPublishedPortfolios(),
      this.getPublishedFaqs(),
      this.getPublishedTenders(),
      this.getPublishedCategories(),
    ]);

    // Add posts
    posts.forEach((post: any) => {
      urls.push({
        url: `/blog/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Add services
    services.forEach((service: any) => {
      urls.push({
        url: `/services/${service.slug}`,
        lastModified: service.updatedAt || service.createdAt,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    });

    // Add portfolios
    portfolios.forEach((portfolio: any) => {
      urls.push({
        url: `/portfolio/${portfolio.slug}`,
        lastModified: portfolio.updatedAt || portfolio.createdAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });

    // Add FAQs
    faqs.forEach((faq: any) => {
      urls.push({
        url: `/faq/${faq.slug}`,
        lastModified: faq.updatedAt || faq.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    // Add tenders
    tenders.forEach((tender: any) => {
      urls.push({
        url: `/tenders/${tender.slug}`,
        lastModified: tender.updatedAt || tender.createdAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Add categories
    categories.forEach((category: any) => {
      urls.push({
        url: `/categories/${category.slug}`,
        lastModified: category.updatedAt || category.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    return {
      urls,
      lastModified: new Date(),
    };
  }

  /**
   * Generate sitemap for specific content type
   */
  async generateSitemapByType(type: string): Promise<SitemapData> {
    const urls: SitemapUrl[] = [];

    switch (type) {
      case 'posts':
        const posts = await this.getPublishedPosts();
        posts.forEach((post: any) => {
          urls.push({
            url: `/blog/${post.slug}`,
            lastModified: post.updatedAt || post.createdAt,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
        break;

      case 'services':
        const services = await this.getPublishedServices();
        services.forEach((service: any) => {
          urls.push({
            url: `/services/${service.slug}`,
            lastModified: service.updatedAt || service.createdAt,
            changeFrequency: 'monthly',
            priority: 0.9,
          });
        });
        break;

      case 'portfolio':
        const portfolios = await this.getPublishedPortfolios();
        portfolios.forEach((portfolio: any) => {
          urls.push({
            url: `/portfolio/${portfolio.slug}`,
            lastModified: portfolio.updatedAt || portfolio.createdAt,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        });
        break;

      case 'faq':
        const faqs = await this.getPublishedFaqs();
        faqs.forEach((faq: any) => {
          urls.push({
            url: `/faq/${faq.slug}`,
            lastModified: faq.updatedAt || faq.createdAt,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        });
        break;

      case 'tenders':
        const tenders = await this.getPublishedTenders();
        tenders.forEach((tender: any) => {
          urls.push({
            url: `/tenders/${tender.slug}`,
            lastModified: tender.updatedAt || tender.createdAt,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
        break;

      case 'categories':
        const categories = await this.getPublishedCategories();
        categories.forEach((category: any) => {
          urls.push({
            url: `/categories/${category.slug}`,
            lastModified: category.updatedAt || category.createdAt,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        });
        break;

      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    return {
      urls,
      lastModified: new Date(),
    };
  }

  /**
   * Convert sitemap data to XML format
   */
  convertToXml(sitemapData: SitemapData): string {
    const { urls, lastModified } = sitemapData;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((url) => {
      xml += '  <url>\n';
      xml += `    <loc>${url.url}</loc>\n`;
      xml += `    <lastmod>${url.lastModified.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${url.changeFrequency}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
  }

  /**
   * Get published posts
   */
  private async getPublishedPosts(): Promise<Post[]> {
    return this.postModel
      .find({ status: Status.PUBLISHED })
      .select('slug updatedAt createdAt')
      .exec();
  }

  /**
   * Get published services
   */
  private async getPublishedServices(): Promise<Service[]> {
    return this.serviceModel
      .find({ status: Status.PUBLISHED })
      .select('slug updatedAt createdAt')
      .exec();
  }

  /**
   * Get published portfolios
   */
  private async getPublishedPortfolios(): Promise<Portfolio[]> {
    return this.portfolioModel
      .find({ status: Status.PUBLISHED })
      .select('slug updatedAt createdAt')
      .exec();
  }

  /**
   * Get published FAQs
   */
  private async getPublishedFaqs(): Promise<Faq[]> {
    return this.faqModel
      .find({ status: Status.PUBLISHED })
      .select('slug updatedAt createdAt')
      .exec();
  }

  /**
   * Get published tenders
   */
  private async getPublishedTenders(): Promise<Tender[]> {
    return this.tenderModel
      .find({ status: Status.PUBLISHED })
      .select('slug updatedAt createdAt')
      .exec();
  }

  /**
   * Get published categories
   */
  private async getPublishedCategories(): Promise<Category[]> {
    return this.categoryModel
      .find()
      .select('slug updatedAt createdAt')
      .exec();
  }
} 