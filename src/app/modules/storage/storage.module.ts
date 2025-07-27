import { forwardRef, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { S3Service } from './services/s3.service';
import { StorageController } from './controllers/storage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // import the Users model
    MongooseModule.forFeature([
      {
        name: 'Users',
        schema: UserSchema,
      },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [AuthService, S3Service, StorageService],
  controllers: [StorageController],
  exports: [S3Service, StorageService],
})
export class StorageModule {}
