import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostLayoutController } from './post-layout.controller';
import { PostLayoutService } from './post-layout.service';
import { PostLayout, PostLayoutSchema } from './schemas/post-layout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostLayout.name, schema: PostLayoutSchema },
    ]),
  ],
  controllers: [PostLayoutController],
  providers: [PostLayoutService],
  exports: [PostLayoutService],
})
export class PostLayoutModule {}
