import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustrySchema } from './schemas/industry.schema';
import { IndustryService } from './services/industry.service';
import { IndustryController } from './controllers/industry.controller';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { UserModule } from 'src/app/modules/user/user.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      // crm industry
      {
        name: 'CRM_Industries',
        schema: IndustrySchema,
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
  ],
  providers: [AuthService, IndustryService],
  controllers: [IndustryController],
  exports: [IndustryService],
})
export class IndustryModule {}
