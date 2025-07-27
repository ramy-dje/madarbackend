import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from '../schemas/tag.schema';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { throwIf } from 'src/core/exceptions/throw-if';

export interface TagValidationOptions {
  allowMultiple?: boolean;
  required?: boolean;
  allowEmpty?: boolean;
}

@Injectable()
export class TagValidationService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) {}

  /**
   * Validates tag IDs against a specific tag type
   * @param tagIds - Array of tag IDs to validate
   * @param expectedType - The expected tag type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateTagsByType(
    tagIds: string[] | Types.ObjectId[] | undefined,
    expectedType: TagType,
    options: TagValidationOptions = {},
  ): Promise<void> {
    const { allowMultiple = true, required = false, allowEmpty = true } = options;

    // Handle empty/undefined case
    if (!tagIds || tagIds.length === 0) {
      if (required) {
        throw new BadRequestException(`At least one ${expectedType} tag is required`);
      }
      if (!allowEmpty) {
        throw new BadRequestException(`${expectedType} tags cannot be empty`);
      }
      return;
    }

    // Convert to string array for validation
    const tagIdsArray = tagIds.map(id => id.toString());

    // Validate ObjectId format
    tagIdsArray.forEach(id => {
      throwIf(!Types.ObjectId.isValid(id), `Invalid tag ID format: ${id}`);
    });

    // Check for duplicates if multiple tags are not allowed
    if (!allowMultiple && tagIdsArray.length > 1) {
      throw new BadRequestException(`Only one ${expectedType} tag is allowed`);
    }

    // Validate that all tags exist and are of the correct type
    const tags = await this.tagModel
      .find({
        _id: { $in: tagIdsArray },
        type: expectedType,
      })
      .select('_id name type isActive')
      .exec();

    // Check if all provided IDs were found
    if (tags.length !== tagIdsArray.length) {
      const foundIds = tags.map(tag => tag._id.toString());
      const missingIds = tagIdsArray.filter(id => !foundIds.includes(id));
      
      throw new BadRequestException(
        `Tags not found or invalid type: ${missingIds.join(', ')}. Expected type: ${expectedType}`
      );
    }

    // Check if all tags are active
    const activeTags = tags.filter(tag => tag.isActive !== false);

    if (activeTags.length !== tags.length) {
      const inactiveIds = tags
        .filter(tag => tag.isActive === false)
        .map(tag => tag._id.toString());
      
      throw new BadRequestException(
        `Inactive tags found: ${inactiveIds.join(', ')}`
      );
    }
  }

  /**
   * Validates a single tag ID against a specific tag type
   * @param tagId - Tag ID to validate
   * @param expectedType - The expected tag type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateTagByType(
    tagId: string | Types.ObjectId | undefined,
    expectedType: TagType,
    options: TagValidationOptions = {},
  ): Promise<void> {
    const tagIds = tagId ? [tagId] : undefined;
    await this.validateTagsByType(tagIds as string[] | Types.ObjectId[], expectedType, options);
  }

  /**
   * Gets valid tag IDs for a specific type
   * @param tagIds - Array of tag IDs to filter
   * @param expectedType - The expected tag type
   * @returns Promise<string[]> - Array of valid tag IDs
   */
  async getValidTagIds(
    tagIds: string[] | Types.ObjectId[] | undefined,
    expectedType: TagType,
  ): Promise<string[]> {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }

    const tagIdsArray = tagIds.map(id => id.toString());

    const tags = await this.tagModel
      .find({
        _id: { $in: tagIdsArray },
        type: expectedType,
        isActive: { $ne: false },
      })
      .select('_id')
      .exec();

    return tags.map(tag => tag._id.toString());
  }

  /**
   * Validates tag slugs against a specific tag type
   * @param tagSlugs - Array of tag slugs to validate
   * @param expectedType - The expected tag type
   * @param options - Validation options
   * @returns Promise<void>
   */
  async validateTagsBySlugs(
    tagSlugs: string[] | undefined,
    expectedType: TagType,
    options: TagValidationOptions = {},
  ): Promise<void> {
    const { allowMultiple = true, required = false, allowEmpty = true } = options;

    // Handle empty/undefined case
    if (!tagSlugs || tagSlugs.length === 0) {
      if (required) {
        throw new BadRequestException(`At least one ${expectedType} tag is required`);
      }
      if (!allowEmpty) {
        throw new BadRequestException(`${expectedType} tags cannot be empty`);
      }
      return;
    }

    // Check for duplicates if multiple tags are not allowed
    if (!allowMultiple && tagSlugs.length > 1) {
      throw new BadRequestException(`Only one ${expectedType} tag is allowed`);
    }

    // Validate that all tag slugs exist and are of the correct type
    const tags = await this.tagModel
      .find({
        slug: { $in: tagSlugs },
        type: expectedType,
        isActive: { $ne: false },
      })
      .select('_id slug name type')
      .exec();

    // Check if all provided slugs were found
    if (tags.length !== tagSlugs.length) {
      const foundSlugs = tags.map(tag => tag.slug);
      const missingSlugs = tagSlugs.filter(slug => !foundSlugs.includes(slug));
      
      throw new BadRequestException(
        `Tags not found or invalid type: ${missingSlugs.join(', ')}. Expected type: ${expectedType}`
      );
    }
  }

  /**
   * Gets tag IDs from slugs for a specific type
   * @param tagSlugs - Array of tag slugs
   * @param expectedType - The expected tag type
   * @returns Promise<Types.ObjectId[]> - Array of tag ObjectIds
   */
  async getTagIdsFromSlugs(
    tagSlugs: string[] | undefined,
    expectedType: TagType,
  ): Promise<Types.ObjectId[]> {
    if (!tagSlugs || tagSlugs.length === 0) {
      return [];
    }

    const tags = await this.tagModel
      .find({
        slug: { $in: tagSlugs },
        type: expectedType,
        isActive: { $ne: false },
      })
      .select('_id')
      .exec();

    return tags.map(tag => tag._id as Types.ObjectId);
  }
} 