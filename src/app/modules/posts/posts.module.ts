import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';
import { SeoModule } from '../../../core/seo.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
      { name: 'Users', schema: UserSchema },
    ]),
    CategoriesModule,
    TagsModule,
    SeoModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
