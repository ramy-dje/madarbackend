import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserService } from '../user/services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtService } from '../jwt/services/jwt.service';
import { JwtModule } from '../jwt/jwt.module';
import { RoleModule } from './modules/role/role.module';
import { CRMModule } from '../crm/crm.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Users',
        schema: UserSchema,
      },
    ]),
    forwardRef(() => UserModule),
    // jwt module
    JwtModule,
    // role module
    RoleModule,
    // CRM module
    CRMModule,
    // Storage Module
    StorageModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtService, 
    AuthService, 
    UserService, 
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
