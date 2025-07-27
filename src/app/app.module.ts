import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from 'src/core/core.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './modules/storage/storage.module';
import { CRMModule } from './modules/crm/crm.module';
import { FileManagerModule } from './modules/file-manager/file-manager.module';
import fileManagerConfig from 'src/app/modules/file-manager/config/file-manager.config';
import { HttpMiddleware } from 'src/core/middlewares/http.middleware';
import { MailerModule } from './modules/mailer/mailer.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServicesModule } from './modules/services/services.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ChartsModule } from './modules/charts/charts.module';
import { FaqModule } from './modules/faq/faq.module';
import { TendersModule } from './modules/tenders/tenders.module';
import { FormsModule } from './modules/forms/forms.module';
import { TagsModule } from './modules/tags/tags.module';
import { SeoModule } from './modules/seo/seo.module';
import { LayoutConfigModule } from './modules/layout-config/layout-config.module';
import { PostLayoutModule } from './modules/posts-layout/post-layout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [fileManagerConfig],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      onConnectionCreate: () => {
        const logger = new Logger('MongooseModule');
        logger.log('Connected to database');
      },
    }),
    CoreModule,
    JwtModule,
    StorageModule,
    UserModule,
    AuthModule,
    CRMModule,
    FileManagerModule,
    MailerModule,
    PostsModule,
    CategoriesModule,
    ServicesModule,
    PortfolioModule,
    ChartsModule,
    FaqModule,
    TendersModule,
    FormsModule,
    TagsModule,
    SeoModule,
    LayoutConfigModule,
    PostLayoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
