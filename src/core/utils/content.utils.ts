import { Model } from 'mongoose';
import { SeoService } from '../services/seo.service';
import { SlugService } from '../services/slug.service';

export interface ContentCreateDto {
  title: string | { [key: string]: string };
  slug?: string;
  seo?: any;
  [key: string]: any;
}

export interface SeoGenerationOptions {
  type: string;
  slug: string;
  author?: string;
}

/**
 * Extract title from multilingual or single language title
 */
export function extractTitle(title: string | { [key: string]: string }): string {
  if (typeof title === 'string') {
    return title;
  }
  
  // For multilingual titles, prefer English, then Arabic, then French, then first available
  return title.en || title.ar || title.fr || Object.values(title)[0] || 'Untitled';
}

/**
 * Generate slug if not provided
 */
export async function generateSlugIfNeeded<T>(
  dto: ContentCreateDto,
  model: Model<T>,
  slugService: SlugService
): Promise<string> {
  if (dto.slug) {
    return dto.slug;
  }

  const title = extractTitle(dto.title);
  const existingSlugs = await model.distinct('slug').exec() as string[];
  return slugService.generateSlug(title, existingSlugs);
}

/**
 * Generate SEO data if not provided
 */
export function generateSeoIfNeeded(
  dto: ContentCreateDto,
  options: SeoGenerationOptions,
  seoService: SeoService
): any {
  if (dto.seo) {
    return dto.seo;
  }

  return seoService.generateSeoData(dto, options);
}

/**
 * Prepare content data with automatic slug and SEO generation
 */
export async function prepareContentData<T>(
  dto: ContentCreateDto,
  model: Model<T>,
  options: SeoGenerationOptions,
  seoService: SeoService,
  slugService: SlugService,
  additionalData: any = {}
): Promise<any> {
  // Generate slug if not provided
  const slug = await generateSlugIfNeeded(dto, model, slugService);
  
  // Generate SEO data if not provided
  const seo = generateSeoIfNeeded(dto, { ...options, slug }, seoService);

  return {
    ...dto,
    slug,
    seo,
    ...additionalData,
  };
} 