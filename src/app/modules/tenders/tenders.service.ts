import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { TenderQueryDto } from './dto/tender-query.dto';
import { Tender, TenderDocument} from './schemas/tender.schema';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';
import { Status } from 'src/app/shared/enums/status.enum';

@Injectable()
export class TendersService {
  constructor(
    @InjectModel(Tender.name)
    private tenderModel: Model<TenderDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
  ) {}

  private convertMapToObject(tender: TenderDocument): any {
    if (tender.submissionInstructions instanceof Map) {
      return {
        ...tender.toObject(),
        submissionInstructions: Object.fromEntries(tender.submissionInstructions)
      };
    }
    return tender.toObject();
  }

  async create(createTenderDto: CreateTenderDto, userId?: string): Promise<Tender> {
    try {
      if (createTenderDto.categories?.length) {
        throwIf(
          !createTenderDto.categories.every((id) =>
            this.coreService.isValid_ObjectId(id.toString()),
          ),
          'Invalid category ID format',
        );
      }

      const tenderData = {
        ...createTenderDto,
        submissionInstructions: new Map(Object.entries(createTenderDto.submissionInstructions)),
        status: createTenderDto.status || Status.DRAFT,
        ...(userId && { author: new Types.ObjectId(userId) })
      };

      const createdTender = new this.tenderModel(tenderData);
      const savedTender = await createdTender.save();
      
      const populatedTender = await this.tenderModel
        .findById(savedTender._id)
        .populate('categories')
        .populate('author', 'name email')
        .exec();
      
      return this.convertMapToObject(populatedTender);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create tender');
    }
  }

  async findAll(query: TenderQueryDto = {}): Promise<Tender[]> {
    try {
      const { search, status, category, categoryIds, categorySlugs, ...rest } = query;
      const filter: any = { ...rest, status: { $ne: Status.TRASH } };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'projectOverview.description': { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.categories = new Types.ObjectId(category);
      }

      if (categoryIds) {
        const categoryIdsArray = categoryIds.split(',').map(id => new Types.ObjectId(id));
        filter.categories = { $in: categoryIdsArray };
      }

      if (categorySlugs) {
        const categorySlugsArray = categorySlugs.split(',');
        filter['categories.slug'] = { $in: categorySlugsArray };
      }

      if (query.tagIds) {
        const tagIdsArray = query.tagIds.split(',').map(id => new Types.ObjectId(id));
        filter.tags = { $in: tagIdsArray };
      }

      const tenders = await this.tenderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('categories')
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .exec();

      return tenders.map(tender => this.convertMapToObject(tender));
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch tenders');
    }
  }

  async findOne(id: string): Promise<Tender> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid tender ID format',
      );

      const tender = await this.tenderModel
        .findOne({ _id: id, status: { $ne: Status.TRASH } })
        .populate('categories')
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .exec();

      throwIfNotFound(tender, `Tender with ID ${id} not found`);
      return this.convertMapToObject(tender);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch tender');
    }
  }

  async update(id: string, updateTenderDto: UpdateTenderDto, userId?: string): Promise<Tender> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid tender ID format',
      );

      if (updateTenderDto.categories?.length) {
        throwIf(
          !updateTenderDto.categories.every((id) =>
            this.coreService.isValid_ObjectId(id.toString()),
          ),
          'Invalid category ID format',
        );
      }

      const updateData = {
        ...updateTenderDto,
        ...(updateTenderDto.submissionInstructions && {
          submissionInstructions: new Map(Object.entries(updateTenderDto.submissionInstructions))
        }),
        ...(userId && { author: new Types.ObjectId(userId) })
      };

      const updatedTender = await this.tenderModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('categories')
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .exec();

      throwIfNotFound(updatedTender, `Tender with ID ${id} not found`);
      return this.convertMapToObject(updatedTender);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update tender');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid tender ID format',
      );

      const result = await this.tenderModel
        .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
        .exec();
      throwIfNotFound(result, `Tender with ID ${id} not found`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete tender');
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid tender ID format',
      );

      const tender = await this.tenderModel.findById(id).exec();
      throwIfNotFound(tender, `Tender with ID ${id} not found`);
      
      throwIf(
        tender.status !== Status.TRASH,
        'Tender must be in trash before it can be permanently deleted'
      );

      await this.tenderModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to permanently delete tender');
    }
  }

  async restore(id: string): Promise<Tender> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid tender ID format',
      );

      const tender = await this.tenderModel.findById(id).exec();
      throwIfNotFound(tender, `Tender with ID ${id} not found`);
      
      throwIf(
        tender.status !== Status.TRASH,
        'Tender must be in trash to be restored'
      );

      const restoredTender = await this.tenderModel
        .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
        .populate('categories')
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .exec();

      return this.convertMapToObject(restoredTender);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore tender');
    }
  }

  async findTrashed(): Promise<Tender[]> {
    try {
      const tenders = await this.tenderModel
        .find({ status: Status.TRASH })
        .populate('categories')
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .sort({ updatedAt: -1 })
        .exec();
      
      return tenders.map(tender => this.convertMapToObject(tender));
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch trashed tenders');
    }
  }



  async findActive(): Promise<Tender[]> {
    try {
      const now = new Date();
      const tenders = await this.tenderModel
        .find({
          status: Status.PUBLISHED,
          submissionDeadline: { $gt: now },
        })
        .populate('categories')
        .sort({ submissionDeadline: 1 })
        .exec();
      
      return tenders.map(tender => this.convertMapToObject(tender));
    } catch (error) {
      throw new BadRequestException('Error fetching active tenders', error);
    }
  }

  async updateStatus(id: string, status: Status): Promise<Tender> {
    try {
      const updatedTender = await this.tenderModel
        .findByIdAndUpdate(
          id,
          { $set: { status } },
          { new: true, runValidators: true },
        )
        .populate('categories')
        .exec();

      if (!updatedTender) {
        throw new NotFoundException('Tender', id);
      }
      return this.convertMapToObject(updatedTender);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating tender status', error);
    }
  }

  async searchByProjectOverview(searchTerm: string): Promise<Tender[]> {
    try {
      const tenders = await this.tenderModel
        .find({
          $or: [
            {
              'projectOverview.description': {
                $regex: searchTerm,
                $options: 'i',
              },
            },
            {
              'projectOverview.objectives': {
                $regex: searchTerm,
                $options: 'i',
              },
            },
            {
              'projectOverview.requirements': {
                $regex: searchTerm,
                $options: 'i',
              },
            },
          ],
        })
        .populate('categories')
        .sort({ createdAt: -1 })
        .exec();
      
      return tenders.map(tender => this.convertMapToObject(tender));
    } catch (error) {
      throw new BadRequestException('Error searching tenders', error);
    }
  }

  async findUpcomingDeadlines(days: number = 7): Promise<Tender[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const tenders = await this.tenderModel
        .find({
          status: Status.PUBLISHED,
          submissionDeadline: {
            $gt: now,
            $lte: futureDate,
          },
        })
        .populate('categories')
        .sort({ submissionDeadline: 1 })
        .exec();
      
      return tenders.map(tender => this.convertMapToObject(tender));
    } catch (error) {
      throw new BadRequestException('Error fetching upcoming deadlines', error);
    }
  }
}
