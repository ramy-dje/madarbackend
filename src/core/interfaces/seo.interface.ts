export interface SeoMetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  robots: string;
  author?: string;
  language?: string;
}

export interface SocialMetaTags {
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
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface SeoData {
  metaTags: SeoMetaTags;
  socialTags: SocialMetaTags;
  structuredData?: StructuredData;
  breadcrumbs?: BreadcrumbItem[];
  alternateLanguages?: Record<string, string>;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface SeoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SitemapUrl {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SitemapData {
  urls: SitemapUrl[];
  lastModified: Date;
}

export interface SeoConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  siteName: string;
  siteUrl: string;
  defaultMetaTags: Partial<SeoMetaTags>;
  defaultSocialTags: Partial<SocialMetaTags>;
  robotsTxt: string;
  sitemapEnabled: boolean;
  structuredDataEnabled: boolean;
} 