import { Global, Module } from '@nestjs/common';
import { FileManagerService } from './services/FileManagerService.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { FilesController } from './controllers/files.controller';
import { FoldersController } from './controllers/folders.controller';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '../mailer/mailer.module';
import { UserModule } from '../user/user.module';
import { AnalyticsController } from './controllers/analytics.controler';
import { RoleModule } from '../auth/modules/role/role.module';
import { TrashController } from './controllers/trash.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 10000),
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MailerModule,
    UserModule,
    RoleModule,
  ],
  controllers: [
    FilesController,
    FoldersController,
    AnalyticsController,
    TrashController,
  ],
  providers: [FileManagerService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
