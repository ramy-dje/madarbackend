import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostLayoutDto } from './dto/create-post-layout.dto';
import { PostLayout, PostLayoutDocument } from './schemas/post-layout.schema';
import { throwIf, throwIfNotFound } from 'src/core/exceptions/throw-if';
import { CoreService } from 'src/core/services/core.service';
import { UpdatePostLayoutDto } from './dto/update-post-layout.dto';

@Injectable()
export class PostLayoutService implements OnModuleInit {
  logger = new Logger(PostLayoutService.name);
  constructor(
    @InjectModel(PostLayout.name)
    private postLayoutModel: Model<PostLayoutDocument>,
    @Inject(CoreService) private readonly coreService: CoreService,
  ) {}

  async onModuleInit() {
    this.logger.log('PostLayoutService initialized');
    await this.createDefaultPostLayout();
  }
  async createDefaultPostLayout(): Promise<PostLayout> {
    try {
      const createPostLayoutDto: CreatePostLayoutDto = {
        layoutType: 'right-sidebar',
        displayType: 'grid',
        navigationType: 'pagination',
        sidebarWidgets: [
          'categories',
          'tags',
          'search',
          'recentPosts',
          'social',
        ],
        gridColumns: 2,
      };
      // Check if a post layout already exists (adjust filter as needed)
      const existingLayout = await this.postLayoutModel.findOne();
      if (existingLayout) {
        // Return the existing layout or just exit silently
        return existingLayout;
      }
      this.logger.log('Existing layout here');
      // Create and save new layout
      return await this.create(createPostLayoutDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create post layout');
    }
  }

  async create(createPostLayoutDto: CreatePostLayoutDto): Promise<PostLayout> {
    try {
      const createdPostLayout = new this.postLayoutModel(createPostLayoutDto);
      return createdPostLayout.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create post layout');
    }
  }

  async findAll(): Promise<PostLayout[]> {
    return this.postLayoutModel.find().exec();
  }

  async findOne(id: string): Promise<PostLayout> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid post layout ID format',
      );

      const postLayout = await this.postLayoutModel.findById(id).exec();
      throwIfNotFound(postLayout, `post layout with ID ${id} not found`);
      return postLayout;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch post layout');
    }
  }

  async update(
    id: string,
    updatePostLayoutDto: UpdatePostLayoutDto,
  ): Promise<PostLayout> {
    try {
      throwIf(
        !this.coreService.isValid_ObjectId(id),
        'Invalid post layout ID format',
      );

      const updatedPostLayout = await this.postLayoutModel
        .findByIdAndUpdate(id, updatePostLayoutDto, { new: true })
        .exec();

      throwIfNotFound(updatedPostLayout, `post layout with ID ${id} not found`);
      return updatedPostLayout;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post layout');
    }
  }

  async findRootPostLayouts(): Promise<PostLayout[]> {
    return this.postLayoutModel.find().exec();
  }
}
