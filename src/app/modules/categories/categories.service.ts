import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';

@Injectable()
export class CategoriesService {
  logger = new Logger(CategoriesService.name);
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
  ) {}

  private handleDatabaseError(error: any, operation: string): never {
    if (error instanceof HttpException) throw error;

    this.logger.error(`Database error during ${operation}: ${error.message}`);
    throw new HttpException(
      `Error ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private async validateSlug(slug: string, excludeId?: string): Promise<void> {
    try {
      const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };

      const exists = await this.categoryModel.exists(query);
      if (exists) {
        throw new HttpException(
          `Category with slug ${slug} already exists`,
          HttpStatus.CONFLICT,
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'checking category slug');
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      if (createCategoryDto.parentId) {
        throwIf(
          !this.coreService.isValid_ObjectId(
            createCategoryDto.parentId.toString(),
          ),
          'Invalid parent category ID format',
        );

        const parentCategory = await this.categoryModel
          .findById(createCategoryDto.parentId)
          .exec();
        throwIfNotFound(
          parentCategory,
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }

      const createdCategory = new this.categoryModel(createCategoryDto);
      return createdCategory.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll(type?: CategoryType): Promise<Category[]> {
    const query = type ? { type } : {};
    return this.categoryModel.find(query).exec();
  }

  async findOne(id: string): Promise<Category> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid category ID format',
      );

      const category = await this.categoryModel.findById(id).exec();
      throwIfNotFound(category, `Category with ID ${id} not found`);
      return category;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid category ID format',
      );

      if (updateCategoryDto.parentId) {
        throwIf(
          !this.coreService.isValid_ObjectId(
            updateCategoryDto.parentId.toString(),
          ),
          'Invalid parent category ID format',
        );

        const parentCategory = await this.categoryModel
          .findById(updateCategoryDto.parentId)
          .exec();
        throwIfNotFound(
          parentCategory,
          `Parent category with ID ${updateCategoryDto.parentId} not found`,
        );
      }

      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, { new: true })
        .exec();

      throwIfNotFound(updatedCategory, `Category with ID ${id} not found`);
      return updatedCategory;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid category ID format',
      );

      const result = await this.categoryModel.findByIdAndDelete(id).exec();
      throwIfNotFound(result, `Category with ID ${id} not found`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return this.categoryModel
      .find({
        parentId: new Types.ObjectId(parentId),
      })
      .exec();
  }

  async findRootCategories(type?: CategoryType): Promise<Category[]> {
    const query = type ? { parentId: null, type } : { parentId: null };
    return this.categoryModel.find(query).exec();
  }

  async findByParent(parentId: string): Promise<Category[]> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(parentId),
        'Invalid parent category ID format',
      );

      return this.categoryModel.find({ parentId }).exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch child categories',
      );
    }
  }
}
