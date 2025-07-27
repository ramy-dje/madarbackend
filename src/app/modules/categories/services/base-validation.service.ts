import { Injectable } from '@nestjs/common';
import { CategoryValidationService, CategoryValidationOptions } from './category-validation.service';
import { TagValidationService, TagValidationOptions } from '../../tags/services/tag-validation.service';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { Types } from 'mongoose';

@Injectable()
export abstract class BaseValidationService {
  constructor(
    protected readonly categoryValidationService: CategoryValidationService,
    protected readonly tagValidationService: TagValidationService,
  ) {}

  /**
   * Get the category type for this service
   * Must be implemented by each service
   */
  protected abstract getCategoryType(): CategoryType;

  /**
   * Get the tag type for this service
   * Must be implemented by each service
   */
  protected abstract getTagType(): TagType;

  /**
   * Validate categories for this service's type
   */
  protected async validateCategories(
    categoryIds: string[] | Types.ObjectId[] | undefined,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    await this.categoryValidationService.validateCategoriesByType(
      categoryIds,
      this.getCategoryType(),
      options,
    );
  }

  /**
   * Validate a single category for this service's type
   */
  protected async validateCategory(
    categoryId: string | Types.ObjectId | undefined,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    await this.categoryValidationService.validateCategoryByType(
      categoryId,
      this.getCategoryType(),
      options,
    );
  }

  /**
   * Validate category slugs for this service's type
   */
  protected async validateCategorySlugs(
    categorySlugs: string[] | undefined,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    await this.categoryValidationService.validateCategoriesBySlugs(
      categorySlugs,
      this.getCategoryType(),
      options,
    );
  }

  /**
   * Get valid category IDs for this service's type
   */
  protected async getValidCategoryIds(
    categoryIds: string[] | Types.ObjectId[] | undefined,
  ): Promise<string[]> {
    return this.categoryValidationService.getValidCategoryIds(
      categoryIds,
      this.getCategoryType(),
    );
  }

  /**
   * Get category IDs from slugs for this service's type
   */
  protected async getCategoryIdsFromSlugs(
    categorySlugs: string[] | undefined,
  ): Promise<Types.ObjectId[]> {
    return this.categoryValidationService.getCategoryIdsFromSlugs(
      categorySlugs,
      this.getCategoryType(),
    );
  }

  /**
   * Validate tags for this service's type
   */
  protected async validateTags(
    tagIds: string[] | Types.ObjectId[] | undefined,
    options: TagValidationOptions = {},
  ): Promise<void> {
    await this.tagValidationService.validateTagsByType(
      tagIds,
      this.getTagType(),
      options,
    );
  }

  /**
   * Validate a single tag for this service's type
   */
  protected async validateTag(
    tagId: string | Types.ObjectId | undefined,
    options: TagValidationOptions = {},
  ): Promise<void> {
    await this.tagValidationService.validateTagByType(
      tagId,
      this.getTagType(),
      options,
    );
  }

  /**
   * Validate tag slugs for this service's type
   */
  protected async validateTagSlugs(
    tagSlugs: string[] | undefined,
    options: TagValidationOptions = {},
  ): Promise<void> {
    await this.tagValidationService.validateTagsBySlugs(
      tagSlugs,
      this.getTagType(),
      options,
    );
  }

  /**
   * Get valid tag IDs for this service's type
   */
  protected async getValidTagIds(
    tagIds: string[] | Types.ObjectId[] | undefined,
  ): Promise<string[]> {
    return this.tagValidationService.getValidTagIds(tagIds, this.getTagType());
  }

  /**
   * Get tag IDs from slugs for this service's type
   */
  protected async getTagIdsFromSlugs(
    tagSlugs: string[] | undefined,
  ): Promise<Types.ObjectId[]> {
    return this.tagValidationService.getTagIdsFromSlugs(tagSlugs, this.getTagType());
  }
} 