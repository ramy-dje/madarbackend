import { Injectable } from '@nestjs/common';
import { CategoryValidationService, CategoryValidationOptions } from './category-validation.service';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { Types } from 'mongoose';

@Injectable()
export abstract class BaseCategoryValidationService {
  constructor(
    protected readonly categoryValidationService: CategoryValidationService,
  ) {}

  /**
   * Get the category type for this service
   * Must be implemented by each service
   */
  protected abstract getCategoryType(): CategoryType;

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
} 