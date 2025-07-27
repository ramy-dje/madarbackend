import { Injectable } from '@nestjs/common';
import { Model, Document, FilterQuery } from 'mongoose';
import { PaginationQueryInterface, PaginatedResponse } from '../interfaces/pagination.interface';
import { PaginationService } from './pagination.service';

@Injectable()
export abstract class BasePaginationService {
  constructor(protected readonly paginationService: PaginationService) {}

  /**
   * Generic method to get paginated results from any model
   */
  protected async getPaginatedResults<T extends Document>(
    model: Model<T>,
    filter: FilterQuery<T> = {},
    query: PaginationQueryInterface = {},
    populateOptions?: string | string[],
    sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedResponse<T>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(query);

    // Get total count
    const total = await model.countDocuments(filter);

    // Build query
    let queryBuilder = model.find(filter);

    // Apply population if specified
    if (populateOptions) {
      queryBuilder = queryBuilder.populate(populateOptions);
    }

    // Get paginated results
    const data = await queryBuilder
      .sort(sortOptions)
      .skip(skip)
      .limit(size)
      .exec();

    return this.paginationService.createPaginatedResponse(data, total, page, size);
  }

  /**
   * Generic method to get paginated results with custom aggregation
   */
  protected async getPaginatedAggregationResults<T>(
    model: Model<any>,
    pipeline: any[],
    query: PaginationQueryInterface = {}
  ): Promise<PaginatedResponse<T>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(query);

    // Clone pipeline for count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await model.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination to pipeline
    const paginatedPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: size }
    ];

    const data = await model.aggregate(paginatedPipeline);

    return this.paginationService.createPaginatedResponse(data, total, page, size);
  }
} 