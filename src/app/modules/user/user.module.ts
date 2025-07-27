import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserController } from './controllers/user.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';
import { RoleModule } from '../auth/modules/role/role.module';
import { RoleService } from '../auth/modules/role/services/role.service';
import { RoleSchema } from '../auth/modules/role/schemas/role.schema';
import { ContactSchema } from '../crm/modules/contacts/schemas/contact.schema';
import { CRMModule } from '../crm/crm.module';
import { CRMService } from '../crm/services/crm.service';
import { StorageModule } from '../storage/storage.module';
import { StorageService } from '../storage/services/storage.service';
import { S3Service } from '../storage/services/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      // user model
      {
        name: 'Users',
        schema: UserSchema,
      },
      // the role model
      {
        name: 'Roles',
        schema: RoleSchema,
      },
      // contact model
      {
        name: 'CRM_Contacts',
        schema: ContactSchema,
      },
    ]),
    AuthModule,
    RoleModule,
    // CRM module
    CRMModule,
    // Storage Module
    StorageModule,
  ],
  providers: [
    UserService,
    AuthService,
    RoleService,
    CRMService,
    S3Service,
    StorageService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
