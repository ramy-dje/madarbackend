import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { Status } from 'src/app/shared/enums/status.enum';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';
import { BaseCategoryValidationService } from '../categories/services/base-category-validation.service';
import { CategoryValidationService } from '../categories/services/category-validation.service';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';

@Injectable()
export class FaqService extends BaseCategoryValidationService {
  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(CategoryValidationService) categoryValidationService: CategoryValidationService,
  ) {
    super(categoryValidationService);
  }

  protected getCategoryType(): CategoryType {
    return CategoryType.FAQ;
  }

  private async _findFaqById(id: string): Promise<FaqDocument> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this.faqModel.findById(id).exec();
      throwIfNotFound(faq, `FAQ with ID ${id} not found`);
      return faq;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch FAQ');
    }
  }

  private _findQaPairById(faq: FaqDocument, qaPairId: string): number {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(qaPairId),
        'Invalid Q&A pair ID format',
      );

      const index = faq.qaPairs.findIndex(
        (pair) => pair._id.toString() === qaPairId,
      );
      throwIfNotFound(index !== -1, `Q&A pair with ID ${qaPairId} not found`);
      return index;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find Q&A pair');
    }
  }

  async create(createFaqDto: CreateFaqDto, userId?: string): Promise<Faq> {
    try {
      // Validate categories if provided
      if (createFaqDto.categories) {
        await this.validateCategories(createFaqDto.categories);
      }

      const faqData = {
        ...createFaqDto,
        ...(userId && { author: new Types.ObjectId(userId) })
      };

      const createdFaq = new this.faqModel(faqData);
      const savedFaq = await createdFaq.save();
      
      return this.faqModel
        .findById(savedFaq._id)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description type')
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create FAQ');
    }
  }

  async findAll(query: FaqQueryDto = {}): Promise<Faq[]> {
    try {
      const { categoryIds, categorySlugs, ...restQuery } = query;
      const filter: any = { ...restQuery, status: { $ne: Status.TRASH } };

      if (categoryIds) {
        const categoryIdsArray = categoryIds.split(',').map(id => new Types.ObjectId(id));
        filter.categories = { $in: categoryIdsArray };
      }

      if (categorySlugs) {
        const categorySlugsArray = categorySlugs.split(',');
        filter['categories.slug'] = { $in: categorySlugsArray };
      }

      return await this.faqModel
        .find(filter)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description type')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch FAQs');
    }
  }

  async findOne(id: string): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this.faqModel
        .findOne({ _id: id, status: { $ne: Status.TRASH } })
        .populate('author', 'name email')
        .populate('categories', 'name slug description type')
        .exec();
      throwIfNotFound(faq, `FAQ with ID ${id} not found`);
      return faq;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch FAQ');
    }
  }

  async update(id: string, updateFaqDto: UpdateFaqDto, userId?: string): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      // Validate categories if provided
      if (updateFaqDto.categories) {
        await this.validateCategories(updateFaqDto.categories);
      }

      const updateData = {
        ...updateFaqDto,
        ...(userId && { author: new Types.ObjectId(userId) })
      };

      const updatedFaq = await this.faqModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description type')
        .exec();

      throwIfNotFound(updatedFaq, `FAQ with ID ${id} not found`);
      return updatedFaq;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update FAQ');
    }
  }

  async trash(id: string): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const updatedFaq = await this.faqModel
        .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
        .exec();

      throwIfNotFound(updatedFaq, `FAQ with ID ${id} not found`);
      return updatedFaq;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to move FAQ to trash');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const result = await this.faqModel
        .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
        .exec();
      throwIfNotFound(result, `FAQ with ID ${id} not found`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete FAQ');
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this.faqModel.findById(id).exec();
      throwIfNotFound(faq, `FAQ with ID ${id} not found`);
      
      throwIf(
        faq.status !== Status.TRASH,
        'FAQ must be in trash before it can be permanently deleted'
      );

      await this.faqModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to permanently delete FAQ');
    }
  }

  async restore(id: string): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this.faqModel.findById(id).exec();
      throwIfNotFound(faq, `FAQ with ID ${id} not found`);
      
      throwIf(
        faq.status !== Status.TRASH,
        'FAQ must be in trash to be restored'
      );

      const restoredFaq = await this.faqModel
        .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description type')
        .exec();

      return restoredFaq;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore FAQ');
    }
  }

  async findTrashed(): Promise<Faq[]> {
    try {
      return this.faqModel
        .find({ status: Status.TRASH })
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description type')
        .sort({ updatedAt: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch trashed FAQs');
    }
  }

  async addQaPair(
    id: string,
    qaPair: { question: string; answer: string },
  ): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this._findFaqById(id);
      faq.qaPairs.push({
        _id: new Types.ObjectId(),
        ...qaPair,
      });
      return await faq.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add Q&A pair');
    }
  }

  async updateQaPair(
    id: string,
    qaPairId: string,
    qaPair: { question: string; answer: string },
  ): Promise<Faq> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this._findFaqById(id);
      const index = this._findQaPairById(faq, qaPairId);
      faq.qaPairs[index] = { ...qaPair, _id: new Types.ObjectId(qaPairId) };
      return await faq.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update Q&A pair');
    }
  }

  async removeQaPair(id: string, qaPairId: string): Promise<void> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid FAQ ID format');

      const faq = await this._findFaqById(id);
      const index = this._findQaPairById(faq, qaPairId);
      faq.qaPairs.splice(index, 1);
      await faq.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove Q&A pair');
    }
  }
}
