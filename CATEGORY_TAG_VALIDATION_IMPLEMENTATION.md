# Category and Tag Validation Implementation

This document outlines the implementation of category and tag validation across all modules in the system, following DRY principles with clean, readable, and simple code.

## Overview

The system now includes comprehensive validation for both categories and tags across all modules. Each module validates categories and tags based on their specific types defined in the `CategoryType` and `TagType` enums.

## Key Features Implemented

### 1. Category Validation
- **Type-specific validation**: Each module validates categories against its specific category type
- **Comprehensive error handling**: Clear error messages for invalid categories
- **Flexible options**: Support for required, multiple, and empty category validation
- **Performance optimized**: Single database query for validation

### 2. Tag Validation
- **Type-specific validation**: Each module validates tags against its specific tag type
- **Active tag checking**: Only validates active tags
- **Comprehensive error handling**: Clear error messages for invalid tags
- **Flexible options**: Support for required, multiple, and empty tag validation

### 3. Portfolio Features Fix
- **Key-value structure**: Features now properly validate as an array of objects with key-value pairs
- **Proper validation**: Uses `ValidateNested` and `Type` decorators for nested object validation

### 4. Population in Get Endpoints
- **Categories populated**: All get endpoints now populate category details (name, slug, description)
- **Tags populated**: All get endpoints now populate tag details (name, slug, color)
- **Consistent structure**: Uniform population across all modules

## Architecture

### Validation Services

#### CategoryValidationService
Located at: `src/app/modules/categories/services/category-validation.service.ts`

**Key Methods:**
- `validateCategoriesByType()` - Validates category IDs against a specific type
- `validateCategoryByType()` - Validates a single category ID
- `validateCategoriesBySlugs()` - Validates category slugs
- `getValidCategoryIds()` - Gets valid category IDs for a type
- `getCategoryIdsFromSlugs()` - Gets category IDs from slugs

#### TagValidationService
Located at: `src/app/modules/tags/services/tag-validation.service.ts`

**Key Methods:**
- `validateTagsByType()` - Validates tag IDs against a specific type
- `validateTagByType()` - Validates a single tag ID
- `validateTagsBySlugs()` - Validates tag slugs
- `getValidTagIds()` - Gets valid tag IDs for a type
- `getTagIdsFromSlugs()` - Gets tag IDs from slugs

### Base Validation Services

#### BaseCategoryValidationService
Located at: `src/app/modules/categories/services/base-category-validation.service.ts`

Provides convenience methods for services that extend it:
- `validateCategories()` - Uses the service's category type
- `validateCategory()` - Validates a single category
- `validateCategorySlugs()` - Validates category slugs

#### BaseTagValidationService
Located at: `src/app/modules/tags/services/base-tag-validation.service.ts`

Provides convenience methods for services that extend it:
- `validateTags()` - Uses the service's tag type
- `validateTag()` - Validates a single tag
- `validateTagSlugs()` - Validates tag slugs

## Implementation Examples

### Portfolio Module

#### Schema Updates
```typescript
// Added tags field to portfolio schema
@Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
tags: Types.ObjectId[];
```

#### DTO Updates
```typescript
// Added tags field and fixed features validation
@IsArray()
@IsMongoId({ each: true })
@IsOptional()
tags?: Types.ObjectId[];

@IsArray()
@ValidateNested({ each: true })
@Type(() => PortfolioFeatureDto)
@IsOptional()
features?: PortfolioFeatureDto[];
```

#### Service Updates
```typescript
// Added validation services injection
constructor(
  @InjectModel(Portfolio.name) private portfolioModel: Model<PortfolioDocument>,
  @Inject(CoreService) private readonly coreService: CoreService,
  @Inject(CategoryValidationService) private readonly categoryValidationService: CategoryValidationService,
  @Inject(TagValidationService) private readonly tagValidationService: TagValidationService,
) {}

// Added validation in create/update methods
if (createPortfolioDto.categories?.length) {
  await this.categoryValidationService.validateCategoriesByType(
    createPortfolioDto.categories,
    CategoryType.PORTFOLIO
  );
}

if (createPortfolioDto.tags?.length) {
  await this.tagValidationService.validateTagsByType(
    createPortfolioDto.tags,
    TagType.PORTFOLIO
  );
}

// Added population in all get endpoints
.populate('categories', 'name slug description')
.populate('tags', 'name slug color')
```

### Posts Module

#### Service Updates
```typescript
// Extended BaseCategoryValidationService and added tag validation
export class PostsService extends BaseCategoryValidationService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(CategoryValidationService) categoryValidationService: CategoryValidationService,
    @Inject(TagValidationService) private readonly tagValidationService: TagValidationService,
    // ... other dependencies
  ) {
    super(categoryValidationService);
  }

  protected getCategoryType(): CategoryType {
    return CategoryType.POST;
  }

  // Added tag validation
  if (createPostDto.tags?.length) {
    await this.tagValidationService.validateTagsByType(
      createPostDto.tags,
      TagType.POST
    );
  }
}
```

## Module Setup Requirements

### For Each Module That Needs Category/Tag Validation:

1. **Import Required Modules:**
```typescript
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    // ... other imports
    CategoriesModule,
    TagsModule,
  ],
  // ... rest of module config
})
```

2. **Inject Validation Services:**
```typescript
constructor(
  // ... other dependencies
  @Inject(CategoryValidationService) private readonly categoryValidationService: CategoryValidationService,
  @Inject(TagValidationService) private readonly tagValidationService: TagValidationService,
) {}
```

3. **Add Validation in Create/Update Methods:**
```typescript
// Category validation
if (dto.categories?.length) {
  await this.categoryValidationService.validateCategoriesByType(
    dto.categories,
    CategoryType.YOUR_TYPE
  );
}

// Tag validation
if (dto.tags?.length) {
  await this.tagValidationService.validateTagsByType(
    dto.tags,
    TagType.YOUR_TYPE
  );
}
```

4. **Add Population in Get Endpoints:**
```typescript
.populate('categories', 'name slug description')
.populate('tags', 'name slug color')
```

## Validation Options

### CategoryValidationOptions
```typescript
interface CategoryValidationOptions {
  allowMultiple?: boolean;  // Default: true
  required?: boolean;       // Default: false
  allowEmpty?: boolean;     // Default: true
}
```

### TagValidationOptions
```typescript
interface TagValidationOptions {
  allowMultiple?: boolean;  // Default: true
  required?: boolean;       // Default: false
  allowEmpty?: boolean;     // Default: true
}
```

## Error Messages

### Category Validation Errors
- `"Invalid category ID format: {id}"`
- `"Categories not found or invalid type: {ids}. Expected type: {type}"`
- `"Inactive categories found: {ids}"`
- `"At least one {type} category is required"`
- `"Only one {type} category is allowed"`

### Tag Validation Errors
- `"Invalid tag ID format: {id}"`
- `"Tags not found or invalid type: {ids}. Expected type: {type}"`
- `"Inactive tags found: {ids}"`
- `"At least one {type} tag is required"`
- `"Only one {type} tag is allowed"`

## Portfolio Features Structure

The portfolio features now properly validate as an array of key-value objects:

```typescript
// Valid features structure
{
  "features": [
    {
      "key": "Technology",
      "value": "React, Node.js, MongoDB"
    },
    {
      "key": "Duration",
      "value": "3 months"
    }
  ]
}
```

## Query Support

### Category Queries
- `categoryIds` - Filter by category IDs (comma-separated)
- `categorySlugs` - Filter by category slugs (comma-separated)

### Tag Queries
- `tagIds` - Filter by tag IDs (comma-separated)
- `tagSlugs` - Filter by tag slugs (comma-separated)

## Best Practices

1. **Always validate categories and tags** in create and update operations
2. **Use the appropriate category/tag type** for each module
3. **Populate categories and tags** in all get endpoints for consistent data structure
4. **Handle validation errors** appropriately in controllers
5. **Test validation scenarios** thoroughly
6. **Follow the established patterns** for consistency across modules

## Migration Guide

For existing modules without category/tag validation:

1. **Import CategoriesModule and TagsModule** in your module
2. **Inject validation services** in your service constructor
3. **Add validation calls** in create/update methods
4. **Add population** in get endpoints
5. **Update DTOs** to include category/tag fields if needed
6. **Test thoroughly** with various validation scenarios

## Testing

Example test cases:
```typescript
describe('Category and Tag Validation', () => {
  it('should validate portfolio categories correctly', async () => {
    const validCategoryId = '507f1f77bcf86cd799439011';
    const invalidCategoryId = '507f1f77bcf86cd799439012';

    // Should pass
    await portfolioService.create({
      title: 'Test Portfolio',
      content: 'Test content',
      categories: [validCategoryId]
    });

    // Should fail
    await expect(
      portfolioService.create({
        title: 'Test Portfolio',
        content: 'Test content',
        categories: [invalidCategoryId]
      })
    ).rejects.toThrow('Categories not found or invalid type');
  });
});
```

This implementation ensures that your categories and tags are always validated correctly while maintaining clean, maintainable code across all modules. 