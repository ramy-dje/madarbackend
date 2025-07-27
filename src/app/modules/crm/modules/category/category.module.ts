import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { StorageModule } from 'src/app/modules/storage/storage.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { UserModule } from 'src/app/modules/user/user.module';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // crm category
      {
        name: 'CRM_Categories',
        schema: CategorySchema,
      },
      // user schema model
      {
        name: 'Users',
        schema: UserSchema,
      },
    ]),
    // user module
    forwardRef(() => UserModule),
    // auth module
    forwardRef(() => AuthModule),
    // storage module
    StorageModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
