import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { Post as PostSchema } from './schemas/post.schema';

@Controller('v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.postsService.create(createPostDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(
    @Query() query: PostQueryDto,
  ): Promise<PaginatedResponse<PostSchema>> {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.postsService.update(id, updatePostDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.postsService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.postsService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.postsService.permanentlyDelete(id);
  }

  @Get('actions/shuffle')
  shufflePosts() {
    return this.postsService.shufflePosts();
  }

  @Get('actions/adjacent/:postOrder')
  getNextAndPreviousPosts(@Param('postOrder') postOrder: number) {
    return this.postsService.getNextAndPreviousPosts(postOrder);
  }
  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('language') language?: string,
  ) {
    return this.postsService.findByCategory(categoryId, language as any);
  }

  @Get('author/:authorId')
  findByAuthor(
    @Param('authorId') authorId: string,
    @Query('language') language?: string,
  ) {
    return this.postsService.findByAuthor(authorId, language as any);
  }
}
