import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { Faq, FaqSchema } from './schemas/faq.schema';
import { CoreModule } from 'src/core/core.module';
import { UserSchema } from '../user/schemas/user.schema';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faq.name, schema: FaqSchema },
      { name: 'Users', schema: UserSchema },
    ]),
    CoreModule,
    CategoriesModule,
  ],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
