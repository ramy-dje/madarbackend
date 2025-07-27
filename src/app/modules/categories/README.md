# Category Validation System

This system provides a robust, reusable way to validate categories across different modules while ensuring type safety and following DRY principles.

## Overview

The category validation system consists of three main components:

1. **CategoryValidationService** - Core validation logic
2. **BaseCategoryValidationService** - Abstract base class for services
3. **CategoryType enum** - Defines valid category types

## Architecture

### CategoryValidationService

The core service that provides all validation methods:

```typescript
@Injectable()
export class CategoryValidationService {
  // Validates category IDs against a specific category type
  async validateCategoriesByType(
    categoryIds: string[] | Types.ObjectId[] | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void>

  // Validates a single category ID
  async validateCategoryByType(
    categoryId: string | Types.ObjectId | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void>

  // Validates category slugs
  async validateCategoriesBySlugs(
    categorySlugs: string[] | undefined,
    expectedType: CategoryType,
    options: CategoryValidationOptions = {},
  ): Promise<void>

  // Gets valid category IDs for a specific type
  async getValidCategoryIds(
    categoryIds: string[] | Types.ObjectId[] | undefined,
    expectedType: CategoryType,
  ): Promise<string[]>

  // Gets category IDs from slugs
  async getCategoryIdsFromSlugs(
    categorySlugs: string[] | undefined,
    expectedType: CategoryType,
  ): Promise<Types.ObjectId[]>
}
```

### BaseCategoryValidationService

Abstract base class that services can extend to get category validation functionality:

```typescript
@Injectable()
export abstract class BaseCategoryValidationService {
  constructor(
    protected readonly categoryValidationService: CategoryValidationService,
  ) {}

  // Must be implemented by each service
  protected abstract getCategoryType(): CategoryType;

  // Convenience methods that use the service's category type
  protected async validateCategories(...): Promise<void>
  protected async validateCategory(...): Promise<void>
  protected async validateCategorySlugs(...): Promise<void>
  protected async getValidCategoryIds(...): Promise<string[]>
  protected async getCategoryIdsFromSlugs(...): Promise<Types.ObjectId[]>
}
```

### CategoryValidationOptions

Configuration options for validation:

```typescript
export interface CategoryValidationOptions {
  allowMultiple?: boolean;  // Default: true
  required?: boolean;       // Default: false
  allowEmpty?: boolean;     // Default: true
}
```

## Usage Examples

### 1. Extending BaseCategoryValidationService (Recommended)

```typescript
@Injectable()
export class FaqService extends BaseCategoryValidationService {
  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    @Inject(CategoryValidationService) categoryValidationService: CategoryValidationService,
  ) {
    super(categoryValidationService);
  }

  protected getCategoryType(): CategoryType {
    return CategoryType.FAQ;
  }

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    // Validate categories if provided
    if (createFaqDto.categories) {
      await this.validateCategories(createFaqDto.categories);
    }

    // Create FAQ...
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    // Validate categories if provided
    if (updateFaqDto.categories) {
      await this.validateCategories(updateFaqDto.categories, {
        required: true,  // Make categories required for updates
        allowMultiple: false,  // Only allow one category
      });
    }

    // Update FAQ...
  }
}
```

### 2. Direct Usage of CategoryValidationService

```typescript
@Injectable()
export class CustomService {
  constructor(
    @Inject(CategoryValidationService) private categoryValidationService: CategoryValidationService,
  ) {}

  async processWithCategories(categoryIds: string[]): Promise<void> {
    // Validate that all categories are of type POST
    await this.categoryValidationService.validateCategoriesByType(
      categoryIds,
      CategoryType.POST,
      { required: true, allowMultiple: true }
    );

    // Process...
  }
}
```

### 3. Validation with Different Options

```typescript
// Require at least one category
await this.validateCategories(categoryIds, { required: true });

// Allow only one category
await this.validateCategories(categoryIds, { allowMultiple: false });

// Don't allow empty categories
await this.validateCategories(categoryIds, { allowEmpty: false });

// Combine options
await this.validateCategories(categoryIds, {
  required: true,
  allowMultiple: false,
  allowEmpty: false
});
```

## Module Setup

### 1. Update your module to import CategoriesModule

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YourModel.name, schema: YourSchema },
      { name: 'Users', schema: UserSchema },
    ]),
    CategoriesModule,  // Add this import
  ],
  controllers: [YourController],
  providers: [YourService],
  exports: [YourService],
})
export class YourModule {}
```

### 2. Extend BaseCategoryValidationService in your service

```typescript
@Injectable()
export class YourService extends BaseCategoryValidationService {
  constructor(
    @InjectModel(YourModel.name) private yourModel: Model<YourDocument>,
    @Inject(CategoryValidationService) categoryValidationService: CategoryValidationService,
  ) {
    super(categoryValidationService);
  }

  protected getCategoryType(): CategoryType {
    return CategoryType.YOUR_TYPE;  // Define your category type
  }

  // Your service methods...
}
```

## Validation Features

### 1. Type Safety
- Ensures categories are of the correct type (FAQ, POST, PORTFOLIO, etc.)
- Validates ObjectId format
- Checks for category existence

### 2. Flexible Options
- **allowMultiple**: Control if multiple categories are allowed
- **required**: Make categories mandatory
- **allowEmpty**: Control empty category arrays

### 3. Comprehensive Error Messages
- Clear error messages indicating which categories are invalid
- Specific type mismatch errors
- Inactive category detection

### 4. Performance Optimized
- Single database query for validation
- Efficient filtering and mapping
- Minimal memory footprint

## Error Handling

The system provides detailed error messages:

```typescript
// Invalid category type
"Categories not found or invalid type: 507f1f77bcf86cd799439011. Expected type: faq"

// Invalid ObjectId format
"Invalid category ID format: invalid-id"

// Inactive categories
"Inactive categories found: 507f1f77bcf86cd799439011"

// Required validation
"At least one faq category is required"

// Multiple categories not allowed
"Only one faq category is allowed"
```

## Best Practices

1. **Always validate categories** in create and update operations
2. **Use the base class** for consistent validation across services
3. **Provide meaningful options** based on your business requirements
4. **Handle validation errors** appropriately in your controllers
5. **Test validation scenarios** thoroughly

## Testing

```typescript
describe('Category Validation', () => {
  it('should validate FAQ categories correctly', async () => {
    const validCategoryId = '507f1f77bcf86cd799439011';
    const invalidCategoryId = '507f1f77bcf86cd799439012';

    // Should pass
    await faqService.validateCategories([validCategoryId]);

    // Should fail
    await expect(
      faqService.validateCategories([invalidCategoryId])
    ).rejects.toThrow('Categories not found or invalid type');
  });
});
```

## Migration Guide

If you have existing services without category validation:

1. **Import CategoriesModule** in your module
2. **Extend BaseCategoryValidationService** in your service
3. **Implement getCategoryType()** method
4. **Add validation calls** in create/update methods
5. **Update constructor** to inject CategoryValidationService
6. **Test thoroughly** with various category scenarios

This system ensures that your categories are always validated correctly while maintaining clean, maintainable code. 