import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { SeoModule } from '../../../core/seo.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: 'Users', schema: UserSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    SeoModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
