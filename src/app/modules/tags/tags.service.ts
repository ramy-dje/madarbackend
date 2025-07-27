import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { TagQueryDto } from './dto/tag-query.dto';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const createdTag = new this.tagModel(createTagDto);
    return createdTag.save();
  }

  async findAll(query: TagQueryDto = {}): Promise<PaginatedResponse<Tag>> {
    const { page = 1, size = 10, search, slug, isActive, type } = query;
    const filter: any = {};
    
    // Apply filters
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (type) {
      filter.type = type;
    }

    if (slug) {
      filter.slug = slug;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * size;
    
    // Execute query with pagination
    const [items, totalItems] = await Promise.all([
      this.tagModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .exec(),
      this.tagModel.countDocuments(filter)
    ]);

    // Return paginated response
    return {
      data: items,
      total: totalItems,
      page,
      size,
      totalPages: Math.ceil(totalItems / size),
      hasNext: page < Math.ceil(totalItems / size),
      hasPrev: page > 1
    };
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateTagDto, { new: true })
      .exec();
    if (!updatedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return updatedTag;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  async findActiveTags(type?: TagType): Promise<Tag[]> {
    const filter: any = { isActive: true };
    if (type) {
      filter.type = type;
    }
    return this.tagModel.find(filter).sort({ name: 1 }).exec();
  }

  async removeBulk(type?: TagType): Promise<{ deletedCount: number }> {
    const filter: any = {};
    if (type) {
      filter.type = type;
    }
    const result = await this.tagModel.deleteMany(filter).exec();
    return { deletedCount: result.deletedCount };
  }
} 