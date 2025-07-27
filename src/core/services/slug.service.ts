import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugService {
  /**
   * Generate a URL-friendly slug from text
   */
  generateSlug(text: string, existingSlugs: string[] = []): string {
    if (!text) {
      throw new Error('Text is required to generate slug');
    }

    // Convert to lowercase and remove special characters
    let slug = text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');

    // If slug is empty after processing, generate a fallback
    if (!slug) {
      slug = 'untitled';
    }

    // Handle duplicates
    slug = this.handleDuplicateSlugs(slug, existingSlugs);

    return slug;
  }

  /**
   * Generate multilingual slugs
   */
  generateMultilingualSlugs(content: {
    title?: { [key: string]: string };
    name?: { [key: string]: string };
  }, existingSlugs: string[] = []): { [key: string]: string } {
    const slugs: { [key: string]: string } = {};
    const titles = content.title || content.name || {};

    for (const [language, title] of Object.entries(titles)) {
      if (title) {
        slugs[language] = this.generateSlug(title, existingSlugs);
      }
    }

    return slugs;
  }

  /**
   * Handle duplicate slugs by appending a number
   */
  private handleDuplicateSlugs(baseSlug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    return newSlug;
  }

  /**
   * Validate if a slug is valid
   */
  validateSlug(slug: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!slug) {
      errors.push('Slug is required');
      return { isValid: false, errors };
    }

    if (slug.length < 3) {
      errors.push('Slug must be at least 3 characters long');
    }

    if (slug.length > 100) {
      errors.push('Slug must be less than 100 characters long');
    }

    // Check for valid characters (letters, numbers, hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    // Check for consecutive hyphens
    if (slug.includes('--')) {
      errors.push('Slug cannot contain consecutive hyphens');
    }

    // Check for leading/trailing hyphens
    if (slug.startsWith('-') || slug.endsWith('-')) {
      errors.push('Slug cannot start or end with a hyphen');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Normalize existing slug (for migration purposes)
   */
  normalizeSlug(slug: string): string {
    return this.generateSlug(slug);
  }

  /**
   * Generate slug suggestions based on text
   */
  generateSlugSuggestions(text: string, existingSlugs: string[] = []): string[] {
    const suggestions: string[] = [];
    
    // Base slug
    const baseSlug = this.generateSlug(text, existingSlugs);
    suggestions.push(baseSlug);

    // Alternative with common words removed
    const wordsToRemove = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => !wordsToRemove.includes(word));
    
    if (filteredWords.length > 0) {
      const alternativeSlug = this.generateSlug(filteredWords.join(' '), existingSlugs);
      if (alternativeSlug !== baseSlug) {
        suggestions.push(alternativeSlug);
      }
    }

    // Shortened version (first 3 words)
    if (words.length > 3) {
      const shortSlug = this.generateSlug(words.slice(0, 3).join(' '), existingSlugs);
      if (shortSlug !== baseSlug && !suggestions.includes(shortSlug)) {
        suggestions.push(shortSlug);
      }
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }
} 