import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SeoData,
  SeoMetaTags,
  SocialMetaTags,
  StructuredData,
  SeoValidationResult,
  SitemapData,
  SitemapUrl,
  SeoConfig,
  BreadcrumbItem,
} from '../interfaces/seo.interface';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);
  private readonly config: SeoConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.initializeSeoConfig();
  }

  private initializeSeoConfig(): SeoConfig {
    return {
      defaultLanguage: this.configService.get('SEO_DEFAULT_LANGUAGE', 'en'),
      supportedLanguages: this.configService.get('SEO_SUPPORTED_LANGUAGES', 'en,ar,fr').split(','),
      siteName: this.configService.get('SEO_SITE_NAME', 'Madar CMS'),
      siteUrl: this.configService.get('SEO_SITE_URL', 'https://madar.com'),
      defaultMetaTags: {
        robots: this.configService.get('SEO_DEFAULT_ROBOTS', 'index, follow'),
        language: this.configService.get('SEO_DEFAULT_LANGUAGE', 'en'),
      },
      defaultSocialTags: {
        ogType: 'website',
        twitterCard: 'summary_large_image',
        ogSiteName: this.configService.get('SEO_SITE_NAME', 'Madar CMS'),
      },
      robotsTxt: this.configService.get('SEO_ROBOTS_TXT', 'User-agent: *\nAllow: /'),
      sitemapEnabled: this.configService.get('SEO_SITEMAP_ENABLED', 'true') === 'true',
      structuredDataEnabled: this.configService.get('SEO_STRUCTURED_DATA_ENABLED', 'true') === 'true',
    };
  }

  /**
   * Generate comprehensive SEO data for content
   */
  generateSeoData(content: any, options: {
    type: string;
    slug?: string;
    language?: string;
    image?: string;
    author?: string;
    publishedAt?: Date;
    modifiedAt?: Date;
  }): SeoData {
    const { type, slug, language = this.config.defaultLanguage, image, author, publishedAt, modifiedAt } = options;

    // Generate meta tags
    const metaTags = this.generateMetaTags(content, { type, slug, language, author });

    // Generate social tags
    const socialTags = this.generateSocialTags(content, { type, slug, language, image });

    // Generate structured data
    const structuredData = this.config.structuredDataEnabled 
      ? this.generateStructuredData(content, { type, publishedAt, modifiedAt })
      : undefined;

    // Generate breadcrumbs
    const breadcrumbs = this.generateBreadcrumbs(content, { type, slug });

    return {
      metaTags,
      socialTags,
      structuredData,
      breadcrumbs,
    };
  }

  /**
   * Generate meta tags
   */
  private generateMetaTags(content: any, options: {
    type: string;
    slug?: string;
    language: string;
    author?: string;
  }): SeoMetaTags {
    const { type, slug, language, author } = options;
    
    const title = this.generateTitle(content, type);
    const description = this.generateDescription(content, type);
    const keywords = this.generateKeywords(content, type);
    const canonicalUrl = this.generateCanonicalUrl(type, slug);

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      robots: this.config.defaultMetaTags.robots || 'index, follow',
      author: author || content.author?.profileInfo?.fullName,
      language,
    };
  }

  /**
   * Generate social media tags
   */
  private generateSocialTags(content: any, options: {
    type: string;
    slug?: string;
    language: string;
    image?: string;
  }): SocialMetaTags {
    const { type, slug, language, image } = options;
    
    const title = this.generateTitle(content, type);
    const description = this.generateDescription(content, type);
    const url = this.generateCanonicalUrl(type, slug);
    const ogImage = image || content.media?.[0] || this.configService.get('SEO_DEFAULT_OG_IMAGE');

    return {
      ogTitle: title,
      ogDescription: description,
      ogImage: ogImage,
      ogType: this.getOgType(type),
      ogUrl: url,
      ogSiteName: this.config.defaultSocialTags.ogSiteName,
      ogLocale: language,
      twitterCard: this.config.defaultSocialTags.twitterCard || 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: ogImage,
      twitterSite: this.configService.get('SEO_TWITTER_SITE'),
      twitterCreator: this.configService.get('SEO_TWITTER_CREATOR'),
    };
  }

  /**
   * Generate structured data (JSON-LD)
   */
  private generateStructuredData(content: any, options: {
    type: string;
    publishedAt?: Date;
    modifiedAt?: Date;
  }): StructuredData {
    const { type, publishedAt, modifiedAt } = options;

    switch (type) {
      case 'post':
        return this.generateArticleStructuredData(content, publishedAt, modifiedAt);
      case 'service':
        return this.generateServiceStructuredData(content);
      case 'portfolio':
        return this.generatePortfolioStructuredData(content);
      case 'faq':
        return this.generateFaqStructuredData(content);
      default:
        return this.generateWebPageStructuredData(content, type);
    }
  }

  /**
   * Generate breadcrumbs
   */
  private generateBreadcrumbs(content: any, options: {
    type: string;
    slug?: string;
  }): BreadcrumbItem[] {
    const { type, slug } = options;
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: 'Home',
        url: this.config.siteUrl,
        position: 1,
      },
    ];

    // Add type-specific breadcrumbs
    switch (type) {
      case 'post':
        breadcrumbs.push(
          { name: 'Blog', url: `${this.config.siteUrl}/blog`, position: 2 },
          { name: content.title?.en || content.title, url: `${this.config.siteUrl}/blog/${slug}`, position: 3 }
        );
        break;
      case 'service':
        breadcrumbs.push(
          { name: 'Services', url: `${this.config.siteUrl}/services`, position: 2 },
          { name: content.title, url: `${this.config.siteUrl}/services/${slug}`, position: 3 }
        );
        break;
      case 'portfolio':
        breadcrumbs.push(
          { name: 'Portfolio', url: `${this.config.siteUrl}/portfolio`, position: 2 },
          { name: content.title, url: `${this.config.siteUrl}/portfolio/${slug}`, position: 3 }
        );
        break;
    }

    return breadcrumbs;
  }

  /**
   * Generate title
   */
  private generateTitle(content: any, type: string): string {
    if (content.seo?.metaTags?.title) {
      return content.seo.metaTags.title;
    }

    const baseTitle = content.title?.en || content.title || 'Untitled';
    const siteName = this.config.siteName;
    
    return `${baseTitle} | ${siteName}`;
  }

  /**
   * Generate description
   */
  private generateDescription(content: any, type: string): string {
    if (content.seo?.metaTags?.description) {
      return content.seo.metaTags.description;
    }

    // Extract description from content
    let description = '';
    if (content.summary) {
      description = content.summary;
    } else if (content.description) {
      description = content.description;
    } else if (content.content?.en) {
      description = this.extractDescriptionFromContent(content.content.en);
    } else if (content.content) {
      description = this.extractDescriptionFromContent(content.content);
    }

    // Truncate to 160 characters
    return description.length > 160 ? description.substring(0, 157) + '...' : description;
  }

  /**
   * Generate keywords
   */
  private generateKeywords(content: any, type: string): string[] {
    if (content.seo?.metaTags?.keywords?.length > 0) {
      return content.seo.metaTags.keywords;
    }

    const keywords: string[] = [];
    
    // Add type-specific keywords
    keywords.push(type);
    
    // Add category keywords
    if (content.categories?.length > 0) {
      content.categories.forEach((category: any) => {
        if (category.name) keywords.push(category.name);
        if (category.slug) keywords.push(category.slug);
      });
    }

    // Add tag keywords
    if (content.tags?.length > 0) {
      content.tags.forEach((tag: any) => {
        if (tag.name) keywords.push(tag.name);
        if (tag.slug) keywords.push(tag.slug);
      });
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Generate canonical URL
   */
  private generateCanonicalUrl(type: string, slug?: string): string {
    if (!slug) {
      return `${this.config.siteUrl}/${type}`;
    }
    return `${this.config.siteUrl}/${type}/${slug}`;
  }

  /**
   * Get Open Graph type
   */
  private getOgType(type: string): string {
    switch (type) {
      case 'post':
        return 'article';
      case 'service':
        return 'website';
      case 'portfolio':
        return 'website';
      default:
        return 'website';
    }
  }

  /**
   * Extract description from content
   */
  private extractDescriptionFromContent(content: string): string {
    // Remove HTML tags and get first 160 characters
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.substring(0, 160);
  }

  /**
   * Generate Article structured data
   */
  private generateArticleStructuredData(content: any, publishedAt?: Date, modifiedAt?: Date): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title?.en || content.title,
      description: this.generateDescription(content, 'post'),
      image: content.media?.[0],
      author: {
        '@type': 'Person',
        name: content.author?.profileInfo?.fullName,
      },
      publisher: {
        '@type': 'Organization',
        name: this.config.siteName,
        logo: {
          '@type': 'ImageObject',
          url: this.configService.get('SEO_LOGO_URL'),
        },
      },
      datePublished: publishedAt?.toISOString(),
      dateModified: modifiedAt?.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': this.generateCanonicalUrl('post', content.slug),
      },
    };
  }

  /**
   * Generate Service structured data
   */
  private generateServiceStructuredData(content: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: content.title,
      description: this.generateDescription(content, 'service'),
      provider: {
        '@type': 'Organization',
        name: this.config.siteName,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Worldwide',
      },
    };
  }

  /**
   * Generate Portfolio structured data
   */
  private generatePortfolioStructuredData(content: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: content.title,
      description: this.generateDescription(content, 'portfolio'),
      creator: {
        '@type': 'Organization',
        name: this.config.siteName,
      },
      image: content.media?.[0],
    };
  }

  /**
   * Generate FAQ structured data
   */
  private generateFaqStructuredData(content: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: content.title,
          acceptedAnswer: {
            '@type': 'Answer',
            text: content.content?.en || content.content,
          },
        },
      ],
    };
  }

  /**
   * Generate WebPage structured data
   */
  private generateWebPageStructuredData(content: any, type: string): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: content.title?.en || content.title,
      description: this.generateDescription(content, type),
      url: this.generateCanonicalUrl(type, content.slug),
    };
  }

  /**
   * Validate SEO data
   */
  validateSeoData(seoData: SeoData): SeoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate meta tags
    if (!seoData.metaTags.title) {
      errors.push('Meta title is required');
    } else if (seoData.metaTags.title.length > 60) {
      warnings.push('Meta title is too long (should be under 60 characters)');
    }

    if (!seoData.metaTags.description) {
      errors.push('Meta description is required');
    } else if (seoData.metaTags.description.length > 160) {
      warnings.push('Meta description is too long (should be under 160 characters)');
    }

    if (seoData.metaTags.keywords.length === 0) {
      suggestions.push('Consider adding keywords for better SEO');
    }

    // Validate social tags
    if (!seoData.socialTags.ogImage) {
      warnings.push('Open Graph image is missing');
    }

    if (!seoData.socialTags.twitterImage) {
      warnings.push('Twitter image is missing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Get SEO configuration
   */
  getSeoConfig(): SeoConfig {
    return this.config;
  }
} 