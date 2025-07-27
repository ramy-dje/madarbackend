import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto, PortfolioLanguage } from './dto/portfolio-query.dto';
import { Portfolio, PortfolioDocument } from './schemas/portfolio.schema';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';
import { Status } from 'src/app/shared/enums/status.enum';
import { CategoryValidationService } from '../categories/services/category-validation.service';
import { TagValidationService } from '../tags/services/tag-validation.service';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { extractTitle } from 'src/core/utils/content.utils';
import { SlugService } from 'src/core/services/slug.service';
import { SeoService } from 'src/core/services/seo.service';
import { prepareContentData } from 'src/core/utils/content.utils';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(CategoryValidationService) private readonly categoryValidationService: CategoryValidationService,
    @Inject(TagValidationService) private readonly tagValidationService: TagValidationService,
    @Inject(SlugService) private readonly slugService: SlugService,
    @Inject(SeoService) private readonly seoService: SeoService,
  ) {}

  // ===== VALIDATION METHODS =====

  /**
   * Validate categories and tags for portfolio
   */
  private async validatePortfolioRelations(
    categories?: Types.ObjectId[],
    tags?: Types.ObjectId[]
  ): Promise<void> {
    if (categories?.length) {
      await this.categoryValidationService.validateCategoriesByType(
        categories,
        CategoryType.PORTFOLIO
      );
    }

    if (tags?.length) {
      await this.tagValidationService.validateTagsByType(
        tags,
        TagType.PORTFOLIO
      );
    }
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
   * Clean empty language fields from multilingual content
   */
  private cleanMultilingualContent(content: any): any {
    if (!content) return content;
    
    const cleaned = { ...content };
    Object.keys(cleaned).forEach(key => {
      if (!cleaned[key] || cleaned[key].trim() === '') {
        delete cleaned[key];
      }
    });
    return cleaned;
  }

  // ===== DATABASE OPERATION METHODS =====

  /**
   * Validate ObjectId format
   */
  private validateObjectId(id: string): void {
    throwIf(
      !this.coreService.isValid_ObjectId(id),
      'Invalid portfolio ID format',
    );
  }



  /**
   * Build filter for portfolio queries
   */
  private buildPortfolioFilter(query: PortfolioQueryDto): any {
    const { categoryIds, categorySlugs, tagIds, tagSlugs, language, ...restQuery } = query;
    const filter: any = { ...restQuery, status: { $ne: Status.TRASH } };

    // Category filtering
    if (categoryIds) {
      const categoryIdsArray = categoryIds.split(',').map(id => new Types.ObjectId(id));
      filter.categories = { $in: categoryIdsArray };
    }

    if (categorySlugs) {
      const categorySlugsArray = categorySlugs.split(',');
      filter['categories.slug'] = { $in: categorySlugsArray };
    }

    // Tag filtering
    if (tagIds) {
      const tagIdsArray = tagIds.split(',').map(id => new Types.ObjectId(id));
      filter.tags = { $in: tagIdsArray };
    }

    if (tagSlugs) {
      const tagSlugsArray = tagSlugs.split(',');
      filter['tags.slug'] = { $in: tagSlugsArray };
    }

    // Language filtering
    if (language) {
      filter[`title.${language}`] = { $exists: true, $ne: null };
      filter[`content.${language}`] = { $exists: true, $ne: null };
    }

    return filter;
  }

  /**
   * Validate language content exists
   */
  private validateLanguageContent(
    portfolio: Portfolio,
    language: PortfolioLanguage
  ): void {
    const hasTitle = portfolio.title[language] && portfolio.title[language].trim() !== '';
    const hasContent = portfolio.content[language] && portfolio.content[language].trim() !== '';
    
    if (!hasTitle || !hasContent) {
      throw new NotFoundException(`Portfolio content not available in ${language} language`);
    }
  }

  // ===== SEO AND SLUG METHODS =====

  /**
   * Generate slug if not provided
   */
  private async generateSlugIfNeeded(
    title: any,
    existingSlug?: string
  ): Promise<string> {
    if (existingSlug) return existingSlug;
    
    const titleText = extractTitle(title);
    const existingSlugs = await this.portfolioModel
      .distinct('slug')
      .exec() as string[];
    
    return this.slugService.generateSlug(titleText, existingSlugs);
  }

  /**
   * Generate SEO if not provided
   */
  private generateSeoIfNeeded(
    data: any,
    slug: string,
    userId?: string
  ): any {
    if (data.seo) return data.seo;
    
    return this.seoService.generateSeoData(data, {
      type: 'portfolio',
      slug,
      author: userId,
    });
  }

  // ===== ERROR HANDLING METHODS =====

  /**
   * Handle common errors
   */
  private handleError(error: any, operation: string): never {
    console.error(`Portfolio ${operation} error:`, error);
    
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    
    // MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      throw new BadRequestException(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new BadRequestException(`${field} already exists`);
    }
    
    throw new InternalServerErrorException(`Failed to ${operation} portfolio item: ${error.message}`);
  }

  // ===== MAIN CRUD METHODS =====

  async create(createPortfolioDto: CreatePortfolioDto, userId?: string): Promise<Portfolio> {
    try {
      // Validate relations
      await this.validatePortfolioRelations(
        createPortfolioDto.categories,
        createPortfolioDto.tags
      );

      // Validate multilingual content
      this.validateMultilingualContent(createPortfolioDto.title, createPortfolioDto.content, 'Title');
      this.validateMultilingualContent(createPortfolioDto.content, createPortfolioDto.content, 'Content');

      // Clean multilingual content
      const cleanedDto = {
        ...createPortfolioDto,
        title: this.cleanMultilingualContent(createPortfolioDto.title),
        content: this.cleanMultilingualContent(createPortfolioDto.content),
        summary: this.cleanMultilingualContent(createPortfolioDto.summary),
      };

      // Prepare content data with automatic slug and SEO generation
      const preparedData = await prepareContentData(
        cleanedDto as any,
        this.portfolioModel,
        { type: 'portfolio', slug: '', author: userId },
        this.seoService,
        this.slugService,
        { ...(userId && { author: new Types.ObjectId(userId) }) }
      );

      const createdPortfolio = new this.portfolioModel(preparedData);
      const savedPortfolio = await createdPortfolio.save();
      
      return this.portfolioModel
        .findById(savedPortfolio._id)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .exec();
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async findAll(query: PortfolioQueryDto = {}): Promise<Portfolio[]> {
    try {
      const filter = this.buildPortfolioFilter(query);

      return this.portfolioModel
        .find(filter)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .exec();
    } catch (error) {
      this.handleError(error, 'fetch');
    }
  }

  async findOne(id: string, language?: PortfolioLanguage): Promise<Portfolio> {
    try {
      this.validateObjectId(id);

      const portfolio = await this.portfolioModel
        .findOne({ _id: id, status: { $ne: Status.TRASH } })
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .exec();
      
      throwIfNotFound(portfolio, `Portfolio with ID ${id} not found`);

      // Validate language content if specified
      if (language && portfolio) {
        this.validateLanguageContent(portfolio, language);
      }

      return portfolio;
    } catch (error) {
      this.handleError(error, 'fetch');
    }
  }

  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
    userId?: string,
  ): Promise<Portfolio> {
    try {
      this.validateObjectId(id);

      // Validate relations
      await this.validatePortfolioRelations(
        updatePortfolioDto.categories,
        updatePortfolioDto.tags
      );

      // Get existing portfolio
      const existingPortfolio = await this.portfolioModel.findById(id);
      throwIfNotFound(existingPortfolio, `Portfolio with ID ${id} not found`);

      // Merge and clean data
      const mergedData = {
        ...existingPortfolio.toObject(),
        ...updatePortfolioDto,
        ...(userId && { author: new Types.ObjectId(userId) })
      };

      // Clean multilingual content if updated
      if (updatePortfolioDto.title) {
        mergedData.title = this.cleanMultilingualContent(mergedData.title);
      }
      if (updatePortfolioDto.content) {
        mergedData.content = this.cleanMultilingualContent(mergedData.content);
      }
      if (updatePortfolioDto.summary) {
        mergedData.summary = this.cleanMultilingualContent(mergedData.summary);
      }

      // Generate slug and SEO if needed
      if (updatePortfolioDto.title && !updatePortfolioDto.slug) {
        mergedData.slug = await this.generateSlugIfNeeded(mergedData.title);
      }

      if ((updatePortfolioDto.title || updatePortfolioDto.content || updatePortfolioDto.summary) && !updatePortfolioDto.seo) {
        mergedData.seo = this.generateSeoIfNeeded(mergedData, mergedData.slug, userId);
      }

      const updatedPortfolio = await this.portfolioModel
        .findByIdAndUpdate(id, mergedData, { new: true })
        .exec();

      throwIfNotFound(updatedPortfolio, `Portfolio with ID ${id} not found`);
      
      return this.portfolioModel
        .findById(updatedPortfolio._id)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .exec();
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.validateObjectId(id);

      const result = await this.portfolioModel
        .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
        .exec();
      
      throwIfNotFound(result, `Portfolio with ID ${id} not found`);
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    try {
      this.validateObjectId(id);

      const portfolio = await this.portfolioModel.findById(id).exec();
      throwIfNotFound(portfolio, `Portfolio with ID ${id} not found`);
      
      throwIf(
        portfolio.status !== Status.TRASH,
        'Portfolio must be in trash before it can be permanently deleted'
      );

      await this.portfolioModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.handleError(error, 'permanently delete');
    }
  }

  async restore(id: string): Promise<Portfolio> {
    try {
      this.validateObjectId(id);

      const portfolio = await this.portfolioModel.findById(id).exec();
      throwIfNotFound(portfolio, `Portfolio with ID ${id} not found`);
      
      throwIf(
        portfolio.status !== Status.TRASH,
        'Portfolio must be in trash to be restored'
      );

      const restoredPortfolio = await this.portfolioModel
        .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
        .exec();

      return this.portfolioModel
        .findById(restoredPortfolio._id)
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .exec();
    } catch (error) {
      this.handleError(error, 'restore');
    }
  }

  async findTrashed(): Promise<Portfolio[]> {
    try {
      return this.portfolioModel
        .find({ status: Status.TRASH })
        .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
        .populate('categories', 'name slug description')
        .populate('tags', 'name slug color')
        .sort({ updatedAt: -1 })
        .exec();
    } catch (error) {
      this.handleError(error, 'fetch trashed');
    }
  }

  // ===== HELPER METHODS =====

  async getContentInLanguage(id: string, language: PortfolioLanguage): Promise<any> {
    const portfolio = await this.findOne(id, language);
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return {
      id: (portfolio as any)._id,
      title: portfolio.title[language] || extractTitle(portfolio.title as any),
      summary: portfolio.summary?.[language] || extractTitle(portfolio.summary as any),
      content: portfolio.content[language] || extractTitle(portfolio.content as any),
      features: portfolio.features,
      media: portfolio.media,
      categories: portfolio.categories,
      tags: portfolio.tags,
      slug: portfolio.slug,
      status: portfolio.status,
      author: portfolio.author,
      createdAt: (portfolio as any).createdAt,
      updatedAt: (portfolio as any).updatedAt,
    };
  }
}
