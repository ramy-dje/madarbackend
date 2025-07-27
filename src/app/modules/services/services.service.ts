import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto, ServiceLanguage } from './dto/service-query.dto';
import { Service, ServiceDocument } from './schemas/service.schema';
import { Tag, TagDocument } from '../tags/schemas/tag.schema';
import { TagType } from '../../shared/enums/tag-type.enum';
import { throwIf } from 'src/core/exceptions/throw-if';
import { Status } from 'src/app/shared/enums/status.enum';
import { SeoService } from '../../../core/services/seo.service';
import { SlugService } from '../../../core/services/slug.service';
import { PaginationService } from 'src/core/services/pagination.service';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { prepareContentData } from '../../../core/utils/content.utils';
import { extractTitle } from '../../../core/utils/content.utils';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    private readonly seoService: SeoService,
    private readonly slugService: SlugService,
    private readonly paginationService: PaginationService,
  ) {}

  private async validateTags(tagIds: Types.ObjectId[]): Promise<void> {
    if (tagIds.length > 0) {
      const existingTags = await this.tagModel
        .find({
          _id: { $in: tagIds },
          type: TagType.SERVICE,
        })
        .exec();

      throwIf(
        existingTags.length !== tagIds.length,
        'One or more tag IDs do not exist or are not service tags',
      );
    }
  }

  async create(createServiceDto: CreateServiceDto, userId?: string): Promise<Service> {
    // Validate tags if provided
    if (createServiceDto.tags) {
      await this.validateTags(
        createServiceDto.tags.map((id) => new Types.ObjectId(id)),
      );
    }

    // Prepare content data with automatic slug and SEO generation
    const serviceData = await prepareContentData(
      createServiceDto,
      this.serviceModel,
      { type: 'service', slug: '', author: userId },
      this.seoService,
      this.slugService,
      { ...(userId && { author: new Types.ObjectId(userId) }) }
    );

    const createdService = new this.serviceModel(serviceData);
    return createdService.save().then((savedService) =>
      this.serviceModel
        .findById(savedService._id)
        .populate({
          path: 'categories',
          select: 'name slug description type',
        })
        .populate({
          path: 'tags',
          select: 'name slug description color type',
        })
        .populate({
          path: 'author',
          select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
        })
        .exec()
        .then((service) => service.toJSON()),
    );
  }

  async findAll(query: ServiceQueryDto = {}): Promise<PaginatedResponse<Service>> {
    const {
      search,
      title,
      slug,
      categorySlugs,
      categories,
      tags,
      featureCategory,
      featureCategories,
      hasHighlightedFeatures,
      status,
      statuses,
      authorId,
      authorIds,
      language,
      languages,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      hasMedia,
      hasDocument,
      hasFeatures,
      seoKeywords,
      hasSeoData,
      page = 1,
      size = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...restQuery
    } = query;

    // Build filter object
    const filter: any = { status: { $ne: Status.TRASH } };

    // Text search
    if (search) {
      filter.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ar': { $regex: search, $options: 'i' } },
        { 'title.fr': { $regex: search, $options: 'i' } },
        { 'content.en': { $regex: search, $options: 'i' } },
        { 'content.ar': { $regex: search, $options: 'i' } },
        { 'content.fr': { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Title filter
    if (title) {
      filter.$or = [
        { 'title.en': { $regex: title, $options: 'i' } },
        { 'title.ar': { $regex: title, $options: 'i' } },
        { 'title.fr': { $regex: title, $options: 'i' } }
      ];
    }

    // Slug filter
    if (slug) {
      filter.slug = { $regex: slug, $options: 'i' };
    }

    // Category filtering
    if (categorySlugs) {
      const categorySlugsArray = categorySlugs.split(',');
      filter['categories.slug'] = { $in: categorySlugsArray };
    }

    if (categories && categories.length > 0) {
      const categoryIdsArray = categories.map(id => new Types.ObjectId(id));
      filter.categories = { $in: categoryIdsArray };
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      const tagIdsArray = tags.map(id => new Types.ObjectId(id));
      filter.tags = { $in: tagIdsArray };
    }

    // Feature filtering
    if (featureCategory) {
      filter['features.category'] = featureCategory;
    }

    if (featureCategories && featureCategories.length > 0) {
      filter['features.category'] = { $in: featureCategories };
    }

    if (hasHighlightedFeatures !== undefined) {
      filter['features.isHighlighted'] = hasHighlightedFeatures;
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    // Author filtering
    if (authorId) {
      filter.author = new Types.ObjectId(authorId);
    }

    if (authorIds && authorIds.length > 0) {
      const authorIdsArray = authorIds.map(id => new Types.ObjectId(id));
      filter.author = { $in: authorIdsArray };
    }

    // Language filtering
    if (language) {
      filter.$or = [
        { [`title.${language}`]: { $exists: true, $ne: '' } },
        { [`content.${language}`]: { $exists: true, $ne: '' } }
      ];
    }

    if (languages && languages.length > 0) {
      const languageConditions = languages.map(lang => ({
        $or: [
          { [`title.${lang}`]: { $exists: true, $ne: '' } },
          { [`content.${lang}`]: { $exists: true, $ne: '' } }
        ]
      }));
      filter.$or = languageConditions;
    }

    // Date filtering
    if (createdAfter) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(createdAfter) };
    }

    if (createdBefore) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(createdBefore) };
    }

    if (updatedAfter) {
      filter.updatedAt = { ...filter.updatedAt, $gte: new Date(updatedAfter) };
    }

    if (updatedBefore) {
      filter.updatedAt = { ...filter.updatedAt, $lte: new Date(updatedBefore) };
    }

    // Content filtering
    if (hasMedia !== undefined) {
      if (hasMedia) {
        filter.media = { $exists: true, $ne: [] };
      } else {
        filter.$or = [
          { media: { $exists: false } },
          { media: [] }
        ];
      }
    }

    if (hasDocument !== undefined) {
      if (hasDocument) {
        filter.document = { $exists: true, $ne: '' };
      } else {
        filter.$or = [
          { document: { $exists: false } },
          { document: '' }
        ];
      }
    }

    if (hasFeatures !== undefined) {
      if (hasFeatures) {
        filter.features = { $exists: true, $ne: [] };
      } else {
        filter.$or = [
          { features: { $exists: false } },
          { features: [] }
        ];
      }
    }

    // SEO filtering
    if (seoKeywords) {
      filter.$or = [
        { 'seo.metaTags.keywords': { $regex: seoKeywords, $options: 'i' } },
        { 'seo.metaTags.title': { $regex: seoKeywords, $options: 'i' } },
        { 'seo.metaTags.description': { $regex: seoKeywords, $options: 'i' } }
      ];
    }

    if (hasSeoData !== undefined) {
      if (hasSeoData) {
        filter.seo = { $exists: true, $ne: {} };
      } else {
        filter.$or = [
          { seo: { $exists: false } },
          { seo: {} }
        ];
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get pagination parameters
    const { page: paginatedPage, size: paginationSize, skip } = this.paginationService.getPaginationParams({
      page: query.page || 1,
      size: query.size || 10
    });

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(paginationSize)
        .populate({
          path: 'categories',
          select: 'name slug description type',
        })
        .populate({
          path: 'tags',
          select: 'name slug description color type',
        })
        .populate({
          path: 'author',
          select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
        })
        .exec(),
      this.serviceModel.countDocuments(filter).exec()
    ]);

    return this.paginationService.createPaginatedResponse(data, total, paginatedPage, paginationSize);
  }

  /**
   * Validate multilingual content has at least one language
   */
  private validateMultilingualContent(
    title: any,
    content: any,
    fieldName: string
  ): void {
    if (!title || (!title.en && !title.ar && !title.fr)) {
      throw new BadRequestException(`${fieldName} must have content in at least one language (en, ar, or fr)`);
    }
  }

  /**
   * Validate language content exists
   */
  private validateLanguageContent(
    service: Service,
    language: ServiceLanguage
  ): void {
    const hasTitle = service.title[language] && service.title[language].trim() !== '';
    const hasContent = service.content[language] && service.content[language].trim() !== '';
    
    if (!hasTitle || !hasContent) {
      throw new NotFoundException(`Service content not available in ${language} language`);
    }
  }

  async findOne(id: string, language?: ServiceLanguage): Promise<Service> {
    const service = await this.serviceModel
      .findOne({ _id: id, status: { $ne: Status.TRASH } })
      .populate({
        path: 'categories',
        select: 'name slug description type',
      })
      .populate({
        path: 'tags',
        select: 'name slug description color type',
      })
      .populate({
        path: 'author',
        select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
      })
      .exec();
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Validate language content if specified
    if (language) {
      this.validateLanguageContent(service, language);
    }

    return service;
  }

  async findBySlug(slug: string): Promise<Service> {
    const service = await this.serviceModel
      .findOne({ slug, status: { $ne: Status.TRASH } })
      .populate({
        path: 'categories',
        select: 'name slug description type',
      })
      .populate({
        path: 'tags',
        select: 'name slug description color type',
      })
      .populate({
        path: 'author',
        select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
      })
      .exec();
    if (!service) {
      throw new NotFoundException(`Service with slug ${slug} not found`);
    }
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    userId?: string,
  ): Promise<Service> {
    // Validate tags if provided
    if (updateServiceDto.tags) {
      await this.validateTags(
        updateServiceDto.tags.map((id) => new Types.ObjectId(id)),
      );
    }

    const updateData = {
      ...updateServiceDto,
      ...(userId && { author: new Types.ObjectId(userId) })
    };

    const updatedService = await this.serviceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'categories',
        select: 'name slug description type',
      })
      .populate({
        path: 'tags',
        select: 'name slug description color type',
      })
      .populate({
        path: 'author',
        select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
      })
      .exec();
    if (!updatedService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return updatedService;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceModel
      .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    throwIf(
      service.status !== Status.TRASH,
      'Service must be in trash before it can be permanently deleted'
    );

    await this.serviceModel.findByIdAndDelete(id).exec();
  }

  async restore(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    throwIf(
      service.status !== Status.TRASH,
      'Service must be in trash to be restored'
    );

    const restoredService = await this.serviceModel
      .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
      .populate({
        path: 'categories',
        select: 'name slug description type',
      })
      .populate({
        path: 'tags',
        select: 'name slug description color type',
      })
      .populate({
        path: 'author',
        select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
      })
      .exec();

    return restoredService;
  }

  async findTrashed(): Promise<Service[]> {
    return this.serviceModel
      .find({ status: Status.TRASH })
      .populate({
        path: 'categories',
        select: 'name slug description type',
      })
      .populate({
        path: 'tags',
        select: 'name slug description color type',
      })
      .populate({
        path: 'author',
        select: 'profileInfo.fullName profileInfo.email profileInfo.pic',
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  // ===== HELPER METHODS =====

  async getContentInLanguage(id: string, language: ServiceLanguage): Promise<any> {
    const service = await this.findOne(id, language);
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return {
      id: (service as any)._id,
      title: service.title[language] || extractTitle(service.title as any),
      content: service.content[language] || extractTitle(service.content as any),
      features: service.features,
      media: service.media,
      categories: service.categories,
      tags: service.tags,
      slug: service.slug,
      status: service.status,
      author: service.author,
      createdAt: (service as any).createdAt,
      updatedAt: (service as any).updatedAt,
    };
  }
}
