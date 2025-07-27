import { Injectable } from '@nestjs/common';
import { TagValidationService, TagValidationOptions } from './tag-validation.service';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { Types } from 'mongoose';

@Injectable()
export abstract class BaseTagValidationService {
  constructor(
    protected readonly tagValidationService: TagValidationService,
  ) {}

  /**
   * Get the tag type for this service
   * Must be implemented by each service
   */
  protected abstract getTagType(): TagType;

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