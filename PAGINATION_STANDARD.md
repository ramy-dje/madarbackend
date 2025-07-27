# Pagination Standard

This document outlines the standardized pagination approach used across the entire project.

## Overview

All paginated endpoints in the project now use a consistent approach with:
- Standardized query parameters
- Consistent response format
- Common pagination service
- Reusable DTOs

## Query Parameters

All paginated endpoints accept these standard query parameters:

```typescript
interface PaginationQueryInterface {
  page?: number;  // Page number (default: 1)
  size?: number;  // Items per page (default: 10, max: 100)
}
```

## Response Format

All paginated responses follow this structure:

```typescript
interface PaginatedResponse<T> {
  data: T[];           // Array of items
  total: number;       // Total number of items
  page: number;        // Current page number
  size: number;        // Items per page
  totalPages?: number; // Total number of pages
  hasNext?: boolean;   // Whether there's a next page
  hasPrev?: boolean;   // Whether there's a previous page
}
```

## Usage Examples

### 1. Basic Pagination
```typescript
// Request
GET /v1/posts?page=1&size=10

// Response
{
  "data": [...],
  "total": 50,
  "page": 1,
  "size": 10,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

### 2. Using in Services
```typescript
import { PaginationService } from 'src/core/services/pagination.service';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';

@Injectable()
export class MyService {
  constructor(private readonly paginationService: PaginationService) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<MyEntity>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(query);
    
    const total = await this.model.countDocuments(filter);
    const data = await this.model.find(filter).skip(skip).limit(size).exec();
    
    return this.paginationService.createPaginatedResponse(data, total, page, size);
  }
}
```

### 3. Using in Controllers
```typescript
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';

@Controller('v1/my-entity')
export class MyController {
  @Get()
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<MyEntity>> {
    return this.myService.findAll(query);
  }
}
```

## Files Structure

```
src/
├── core/
│   ├── interfaces/
│   │   └── pagination.interface.ts          # Main pagination interfaces
│   ├── dto/
│   │   └── pagination-query.dto.ts          # Common pagination DTO
│   └── services/
│       ├── pagination.service.ts            # Pagination utility service
│       └── base-pagination.service.ts       # Base service for pagination
```

## Migration Guide

To update existing endpoints to use the new pagination standard:

1. **Update imports**:
   ```typescript
   // Old
   import { ResponseWithPaginationInterface } from 'src/core/interfaces/response-with-pagination.interface';
   
   // New
   import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
   ```

2. **Update DTOs**:
   ```typescript
   // Old
   export class MyQueryDto {
     page?: number = 1;
     limit?: number = 10;
   }
   
   // New
   import { PaginationQueryDto } from 'src/core/dto/pagination-query.dto';
   export class MyQueryDto extends PaginationQueryDto {
     // Additional query parameters
   }
   ```

3. **Update service methods**:
   ```typescript
   // Old
   async findAll(query: MyQueryDto): Promise<MyEntity[]> {
     const skip = (query.page - 1) * query.limit;
     return this.model.find().skip(skip).limit(query.limit);
   }
   
   // New
   async findAll(query: MyQueryDto): Promise<PaginatedResponse<MyEntity>> {
     const { page, size, skip } = this.paginationService.getPaginationParams(query);
     const total = await this.model.countDocuments();
     const data = await this.model.find().skip(skip).limit(size);
     return this.paginationService.createPaginatedResponse(data, total, page, size);
   }
   ```

## Benefits

- **Consistency**: All paginated endpoints follow the same pattern
- **Maintainability**: Centralized pagination logic
- **Flexibility**: Easy to add new paginated endpoints
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized pagination calculations 