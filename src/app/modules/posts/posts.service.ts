import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { Post, PostDocument } from './schemas/post.schema';
import { Status } from 'src/app/shared/enums/status.enum';
import { PostType } from 'src/app/shared/enums/post-type.enum';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';
import { BaseCategoryValidationService } from '../categories/services/base-category-validation.service';
import { CategoryValidationService } from '../categories/services/category-validation.service';
import { TagValidationService } from '../tags/services/tag-validation.service';
import { CategoryType } from 'src/app/shared/enums/category-type.enum';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { prepareContentData } from '../../../core/utils/content.utils';
import { SeoService } from '../../../core/services/seo.service';
import { SlugService } from '../../../core/services/slug.service';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';

export enum PostLanguage {
  AR = 'ar',
  FR = 'fr',
  EN = 'en',
}

@Injectable()
export class PostsService extends BaseCategoryValidationService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(CategoryValidationService)
    categoryValidationService: CategoryValidationService,
    @Inject(TagValidationService)
    private readonly tagValidationService: TagValidationService,
    private readonly seoService: SeoService,
    private readonly slugService: SlugService,
    private readonly paginationService: PaginationService,
  ) {
    super(categoryValidationService);
  }

  protected getCategoryType(): CategoryType {
    return CategoryType.POST;
  }

  /**
   * Parse comma-separated string into array of valid ID strings
   * @param commaSeparatedIds - Comma-separated string of IDs
   * @returns Array of valid ID strings
   */
  private parseCommaSeparatedIds(commaSeparatedIds: string): string[] {
    if (!commaSeparatedIds || typeof commaSeparatedIds !== 'string') {
      console.log(
        'Invalid input for parseCommaSeparatedIds:',
        commaSeparatedIds,
      );
      return [];
    }

    try {
      console.log('Parsing comma-separated IDs:', commaSeparatedIds);
      const splitIds = commaSeparatedIds.split(',');
      console.log('Split IDs:', splitIds);

      const trimmedIds = splitIds.map((id) => id.trim());
      console.log('Trimmed IDs:', trimmedIds);

      const validIds = trimmedIds.filter(
        (id) => id && this.coreService.isValid_ObjectId(id),
      );
      console.log('Valid IDs:', validIds);

      return validIds;
    } catch (error) {
      console.error('Error parsing IDs:', error);
      return [];
    }
  }

  async create(createPostDto: CreatePostDto, userId?: string): Promise<Post> {
    try {
      // Validate categories if provided
      if (createPostDto.categories) {
        await this.validateCategories(createPostDto.categories);
      }

      // Validate tags if provided
      if (createPostDto.tags?.length) {
        await this.tagValidationService.validateTagsByType(
          createPostDto.tags,
          TagType.POST,
        );
      }

      // Prepare content data with automatic slug and SEO generation
      const preparedData = await prepareContentData(
        createPostDto as any,
        this.postModel,
        { type: 'post', slug: '', author: userId },
        this.seoService,
        this.slugService,
        { ...(userId && { author: new Types.ObjectId(userId) }) },
      );

      const createdPost = new this.postModel(preparedData);
      const savedPost = await createdPost.save();

      return this.postModel
        .findById(savedPost._id)
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  /**
   * Find all posts with comprehensive filtering and pagination
   *
   * @param query - Filtering and pagination parameters
   * @returns Paginated response with posts
   *
   * Available filters (all support comma-separated values):
   * - search: Search in title, content, and slug across all languages
   * - types: Filter by post types (post, event, destination, podcast)
   * - statuses: Filter by multiple statuses (published, draft, trash)
   * - categoryIds: Filter by category IDs (comma-separated)
   * - tagIds: Filter by tag IDs (comma-separated)
   * - authorIds: Filter by multiple author IDs (comma-separated)
   * - languages: Filter by multiple content languages (en, ar, fr)
   * - locations: Filter by multiple locations (for events)
   * - page: Page number for pagination
   * - size: Items per page for pagination
   */
  async findAll(query: PostQueryDto = {}): Promise<PaginatedResponse<Post>> {
    try {
      const {
        search,
        types,
        statuses,
        categoryIds,
        tagIds,
        authorIds,
        languages,
        locations,
        ...restQuery
      } = query;

      // Base filter - exclude trashed posts
      const filter: any = {
        status: { $ne: Status.TRASH },
      };

      // If no specific statuses are requested, default to published posts
      if (!statuses || statuses.length === 0) {
        filter.status = Status.PUBLISHED;
      } else {
        // If specific statuses are requested, use them
        filter.status = { $in: statuses };
      }

      // Search functionality - search in title and content across all languages
      if (search) {
        filter.$or = [
          { 'title.en': { $regex: search, $options: 'i' } },
          { 'title.ar': { $regex: search, $options: 'i' } },
          { 'title.fr': { $regex: search, $options: 'i' } },
          { 'content.en': { $regex: search, $options: 'i' } },
          { 'content.ar': { $regex: search, $options: 'i' } },
          { 'content.fr': { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
        ];
      }

      // Post type filtering
      if (types && types.length > 0) {
        filter.type = { $in: types };
      }

      // Category filtering
      if (categoryIds) {
        console.log('Category IDs input:', categoryIds);
        const categoryIdsArray = this.parseCommaSeparatedIds(categoryIds);
        console.log('Parsed category IDs:', categoryIdsArray);

        if (categoryIdsArray.length > 0) {
          filter.categories = { $in: categoryIdsArray };
          console.log('Category filter applied:', filter.categories);
        }
      }

      // Tag filtering
      if (tagIds) {
        const tagIdsArray = this.parseCommaSeparatedIds(tagIds);
        if (tagIdsArray.length > 0) {
          filter.tags = { $in: tagIdsArray };
        }
      }

      // Author filtering (multiple authors)
      if (authorIds && authorIds.length > 0) {
        const authorIdsArray = authorIds.map((id) => new Types.ObjectId(id));
        filter.author = { $in: authorIdsArray };
      }

      // Language filtering - check if content exists in any of the specified languages
      if (languages && languages.length > 0) {
        const languageConditions = languages.flatMap((lang) => [
          { [`title.${lang}`]: { $exists: true, $ne: '' } },
          { [`content.${lang}`]: { $exists: true, $ne: '' } },
        ]);

        if (filter.$or) {
          // If there's already an $or condition (from search), combine them
          filter.$and = [{ $or: filter.$or }, { $or: languageConditions }];
          delete filter.$or;
        } else {
          filter.$or = languageConditions;
        }
      }

      // Location filtering (for events) - multiple locations
      if (locations && locations.length > 0) {
        filter.location = { $in: locations.map((loc) => new RegExp(loc, 'i')) };
      }

      // Get pagination parameters
      const { page, size, skip } =
        this.paginationService.getPaginationParams(query);

      // Debug: Log the final filter
      console.log(
        'Final filter for posts query:',
        JSON.stringify(filter, null, 2),
      );

      // Get total count
      const total = await this.postModel.countDocuments(filter);
      console.log('Total posts found:', total);

      // Get paginated results
      const data = await this.postModel
        .find(filter)
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .exec();

      return this.paginationService.createPaginatedResponse(
        data,
        total,
        page,
        size,
      );
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async findOne(id: string): Promise<Post> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid post ID format');

      const post = await this.postModel
        .findOne({ _id: id, status: { $ne: Status.TRASH } })
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .exec();
      throwIfNotFound(post, `Post with ID ${id} not found`);
      return post;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch post');
    }
  }

  async findBySlug(slug: string): Promise<Post> {
    try {
      const post = await this.postModel
        .findOne({ slug, status: { $ne: Status.TRASH } })
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .exec();
      throwIfNotFound(post, `Post with slug ${slug} not found`);
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch post');
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId?: string,
  ): Promise<Post> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid post ID format');

      // Validate categories if provided
      if (updatePostDto.categories) {
        await this.validateCategories(updatePostDto.categories);
      }

      // Validate tags if provided
      if (updatePostDto.tags?.length) {
        await this.tagValidationService.validateTagsByType(
          updatePostDto.tags,
          TagType.POST,
        );
      }

      // Prepare content data with automatic slug and SEO generation
      const preparedData = await prepareContentData(
        updatePostDto as any,
        this.postModel,
        { type: 'post', slug: '', author: userId },
        this.seoService,
        this.slugService,
        { ...(userId && { author: new Types.ObjectId(userId) }) },
      );

      const updatedPost = await this.postModel
        .findByIdAndUpdate(id, preparedData, { new: true })
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .exec();

      throwIfNotFound(updatedPost, `Post with ID ${id} not found`);
      return updatedPost;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid post ID format');

      const result = await this.postModel
        .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
        .exec();
      throwIfNotFound(result, `Post with ID ${id} not found`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid post ID format');

      const post = await this.postModel.findById(id).exec();
      throwIfNotFound(post, `Post with ID ${id} not found`);

      throwIf(
        post.status !== Status.TRASH,
        'Post must be in trash before it can be permanently deleted',
      );

      await this.postModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to permanently delete post',
      );
    }
  }

  async restore(id: string): Promise<Post> {
    try {
      throwIf(!this.coreService.isValid_ObjectId(id), 'Invalid post ID format');

      const post = await this.postModel.findById(id).exec();
      throwIfNotFound(post, `Post with ID ${id} not found`);

      throwIf(
        post.status !== Status.TRASH,
        'Post must be in trash to be restored',
      );

      const restoredPost = await this.postModel
        .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .exec();

      return restoredPost;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore post');
    }
  }

  async findTrashed(): Promise<Post[]> {
    try {
      return this.postModel
        .find({ status: Status.TRASH })
        .populate(
          'author',
          'profileInfo.fullName profileInfo.email profileInfo.pic',
        )
        .populate('categories', 'name slug description type')
        .populate('tags', 'name slug description color type')
        .sort({ updatedAt: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch trashed posts');
    }
  }
  async findByCategory(
    categoryId: string,
    language?: PostLanguage,
  ): Promise<Post[]> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(categoryId),
        'Invalid category ID format',
      );

      const posts = await this.postModel
        .find({
          categories: new Types.ObjectId(categoryId),
        })
        .populate({
          path: 'categories',
          select: 'name slug description featuredImage type',
        })
        .exec();

      if (language) {
        posts.forEach((post) => this.filterByLanguage(post, language));
      }

      return posts;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch posts by category',
      );
    }
  }

  async findByAuthor(
    authorId: string,
    language?: PostLanguage,
  ): Promise<Post[]> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(authorId),
        'Invalid author ID format',
      );

      const posts = await this.postModel
        .find({
          authorId: new Types.ObjectId(authorId),
        })
        .populate({
          path: 'categories',
          select: 'name slug description featuredImage type',
        })
        .exec();

      if (language) {
        posts.forEach((post) => this.filterByLanguage(post, language));
      }

      return posts;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch posts by author');
    }
  }
  async shufflePosts(): Promise<Partial<Post>[]> {
    try {
      // 1. Get 6 random post IDs using aggregation
      const sampledPosts = await this.postModel.aggregate([
        { $match: {} }, // optional: add filters here
        { $sample: { size: 6 } },
        { $project: { _id: 1 } },
      ]);

      const ids = sampledPosts.map((p) => p._id);

      // 2. Fetch full posts by ID and populate
      const posts = await this.postModel
        .find({ _id: { $in: ids } })
        .populate('authorId', 'profileInfo')
        .populate('category', 'name slug description featuredImage type')
        .populate('categories', 'name slug description featuredImage type')
        .exec();

      return posts;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch shuffled posts');
    }
  }

  async getNextAndPreviousPosts(postOrder: number): Promise<{
    nextPost: Partial<Post> | null;
    previousPost: Partial<Post> | null;
  }> {
    try {
      // 1. Get total number of posts
      const totalPosts = await this.postModel.countDocuments();

      if (totalPosts === 0) {
        return { nextPost: null, previousPost: null };
      }

      // 2. Circular logic for next and previous order
      const nextOrder = (postOrder + 1) % totalPosts;
      const prevOrder = (postOrder - 1 + totalPosts) % totalPosts;

      // 3. Query posts by postOrder (assuming postOrder is unique and indexed)
      const [nextPost, previousPost] = await Promise.all([
        this.postModel
          .findOne({ postOrder: nextOrder })
          .populate('authorId', 'profileInfo')
          .populate('category', 'name slug description featuredImage type')
          .populate('categories', 'name slug description featuredImage type')
          .lean(),
        this.postModel
          .findOne({ postOrder: prevOrder })
          .populate('authorId', 'profileInfo')
          .populate('category', 'name slug description featuredImage type')
          .populate('categories', 'name slug description featuredImage type')
          .lean(),
      ]);

      return { nextPost, previousPost };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch adjacent posts');
    }
  }
  private filterByLanguage(post: Post, language?: PostLanguage): void {
    if (language && post) {
      if (post.title[language]) {
        post.title = { [language]: post.title[language] };
      }
      if (post.content[language]) {
        post.content = { [language]: post.content[language] };
      }
    }
  }
}
