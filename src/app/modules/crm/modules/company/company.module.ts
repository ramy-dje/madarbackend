import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './schemas/contact.schema';
import { CategorySchema } from '../category/schemas/category.schema';
import { IndustrySchema } from '../industry/schemas/industry.schema';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { UserModule } from 'src/app/modules/user/user.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { IndustryService } from '../industry/services/industry.service';
import { CategoryService } from '../category/services/category.service';
import { StorageModule } from 'src/app/modules/storage/storage.module';
import { StorageService } from 'src/app/modules/storage/services/storage.service';
import { S3Service } from 'src/app/modules/storage/services/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      // company model
      {
        name: 'CRM_Companies',
        schema: CompanySchema,
      },
      // crm industry
      {
        name: 'CRM_Industries',
        schema: IndustrySchema,
      },
      // crm category model
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
  providers: [
    AuthService,
    CompanyService,
    IndustryService,
    CategoryService,
    S3Service,
    StorageService,
  ],
  controllers: [CompanyController],
})
export class CompanyModule {}
