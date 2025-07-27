import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { throwIf } from 'src/core/exceptions/throw-if';

export interface CategoryValidationOptions {
  allowMultiple?: boolean;
  required?: boolean;
  allowEmpty?: boolean;
}

@Injectable()
export class CategoryValidationService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Validates category IDs against a specific category type
   * @param categoryIds - Array of category IDs to validate
   * @param expectedType - The expected category type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateCategoriesByType(
    categoryIds: string[] | Types.ObjectId[] | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    const { allowMultiple = true, required = false, allowEmpty = true } = options;

    // Handle empty/undefined case
    if (!categoryIds || categoryIds.length === 0) {
      if (required) {
        throw new BadRequestException(`At least one ${expectedType} category is required`);
      }
      if (!allowEmpty) {
        throw new BadRequestException(`${expectedType} categories cannot be empty`);
      }
      return;
    }

    // Convert to string array for validation
    const categoryIdsArray = categoryIds.map(id => id.toString());

    // Validate ObjectId format
    categoryIdsArray.forEach(id => {
      throwIf(!Types.ObjectId.isValid(id), `Invalid category ID format: ${id}`);
    });

    // Check for duplicates if multiple categories are not allowed
    if (!allowMultiple && categoryIdsArray.length > 1) {
      throw new BadRequestException(`Only one ${expectedType} category is allowed`);
    }

    // Validate that all categories exist and are of the correct type
    const categories = await this.categoryModel
      .find({
        _id: { $in: categoryIdsArray },
        type: expectedType,
      })
      .select('_id name type')
      .exec();

    // Check if all provided IDs were found
    if (categories.length !== categoryIdsArray.length) {
      const foundIds = categories.map(cat => cat._id.toString());
      const missingIds = categoryIdsArray.filter(id => !foundIds.includes(id));
      
      throw new BadRequestException(
        `Categories not found or invalid type: ${missingIds.join(', ')}. Expected type: ${expectedType}`
      );
    }

    // Additional validation: ensure all categories are active (not trashed)
    const activeCategories = categories.filter(cat => 
      !cat['status'] || cat['status'] !== 'trash'
    );

    if (activeCategories.length !== categories.length) {
      const inactiveIds = categories
        .filter(cat => cat['status'] === 'trash')
        .map(cat => cat._id.toString());
      
      throw new BadRequestException(
        `Inactive categories found: ${inactiveIds.join(', ')}`
      );
    }
  }

  /**
   * Validates a single category ID against a specific category type
   * @param categoryId - Category ID to validate
   * @param expectedType - The expected category type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateCategoryByType(
    categoryId: string | Types.ObjectId | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    const categoryIds = categoryId ? [categoryId] : undefined;
    await this.validateCategoriesByType(categoryIds as string[] | Types.ObjectId[], expectedType, options);
  }

  /**
   * Gets valid category IDs for a specific type
   * @param categoryIds - Array of category IDs to filter
   * @param expectedType - The expected category type
   * @returns Promise<string[]> - Array of valid category IDs
   */
  async getValidCategoryIds(
    categoryIds: string[] | Types.ObjectId[] | undefined,
    expectedType: CategoryType,
  ): Promise<string[]> {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }

    const categoryIdsArray = categoryIds.map(id => id.toString());

    const categories = await this.categoryModel
      .find({
        _id: { $in: categoryIdsArray },
        type: expectedType,
      })
      .select('_id')
      .exec();

    return categories.map(cat => cat._id.toString());
  }

  /**
   * Validates category slugs against a specific category type
   * @param categorySlugs - Array of category slugs to validate
   * @param expectedType - The expected category type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateCategoriesBySlugs(
    categorySlugs: string[] | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void> {
    const { allowMultiple = true, required = false, allowEmpty = true } = options;

    // Handle empty/undefined case
    if (!categorySlugs || categorySlugs.length === 0) {
      if (required) {
        throw new BadRequestException(`At least one ${expectedType} category is required`);
      }
      if (!allowEmpty) {
        throw new BadRequestException(`${expectedType} categories cannot be empty`);
      }
      return;
    }

    // Check for duplicates if multiple categories are not allowed
    if (!allowMultiple && categorySlugs.length > 1) {
      throw new BadRequestException(`Only one ${expectedType} category is allowed`);
    }

    // Validate that all category slugs exist and are of the correct type
    const categories = await this.categoryModel
      .find({
        slug: { $in: categorySlugs },
        type: expectedType,
      })
      .select('_id slug name type')
      .exec();

    // Check if all provided slugs were found
    if (categories.length !== categorySlugs.length) {
      const foundSlugs = categories.map(cat => cat.slug);
      const missingSlugs = categorySlugs.filter(slug => !foundSlugs.includes(slug));
      
      throw new BadRequestException(
        `Categories not found or invalid type: ${missingSlugs.join(', ')}. Expected type: ${expectedType}`
      );
    }
  }

  /**
   * Gets category IDs from slugs for a specific type
   * @param categorySlugs - Array of category slugs
   * @param expectedType - The expected category type
   * @returns Promise<Types.ObjectId[]> - Array of category ObjectIds
   */
  async getCategoryIdsFromSlugs(
    categorySlugs: string[] | undefined,
    expectedType: CategoryType,
  ): Promise<Types.ObjectId[]> {
    if (!categorySlugs || categorySlugs.length === 0) {
      return [];
    }

    const categories = await this.categoryModel
      .find({
        slug: { $in: categorySlugs },
        type: expectedType,
      })
      .select('_id')
      .exec();

    return categories.map(cat => cat._id as Types.ObjectId);
  }
} 