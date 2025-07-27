import { Injectable } from '@nestjs/common';
import { PaginationQueryInterface, PaginatedResponse } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationService {
  /**
   * Creates a paginated response with calculated metadata
   */
  createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    size: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / size);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      total,
      page,
      size,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Calculates pagination parameters from query
   */
  getPaginationParams(query: PaginationQueryInterface) {
    const page = Math.max(1, query.page || 1);
    const size = Math.max(1, Math.min(100, query.size || 10)); // Limit max size to 100
    const skip = (page - 1) * size;

    return { page, size, skip };
  }

  /**
   * Validates pagination parameters
   */
  validatePaginationParams(page: number, size: number): boolean {
    return page > 0 && size > 0 && size <= 100;
  }
} 