import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './schemas/role.schema';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { AuthService } from '../../services/auth.service';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { UserModule } from 'src/app/modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      // the role model
      {
        name: 'Roles',
        schema: RoleSchema,
      },
      // user schema model
      {
        name: 'Users',
        schema: UserSchema,
      },
    ]),
    // user module
    forwardRef(() => UserModule),
  ],
  providers: [RoleService, AuthService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
