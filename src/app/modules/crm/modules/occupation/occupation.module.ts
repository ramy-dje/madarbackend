import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OccupationSchema } from './schemas/occupation.schema';
import { OccupationService } from './services/occupation.service';
import { OccupationController } from './controllers/occupation.controller';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { UserModule } from 'src/app/modules/user/user.module';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { StorageModule } from 'src/app/modules/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      // crm occupation
      {
        name: 'CRM_Occupations',
        schema: OccupationSchema,
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
  providers: [AuthService, OccupationService],
  controllers: [OccupationController],
})
export class OccupationModule {}
