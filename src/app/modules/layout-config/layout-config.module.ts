import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LayoutConfigController } from './layout-config.controller';
import { LayoutConfigService } from './layout-config.service';
import { LayoutConfig, LayoutConfigSchema } from './schemas/layout-config.schema';
import { Widget, WidgetSchema } from './schemas/widget.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LayoutConfig.name, schema: LayoutConfigSchema },
      { name: Widget.name, schema: WidgetSchema },
    ]),
    AuthModule,
  ],
  controllers: [LayoutConfigController],
  providers: [LayoutConfigService],
  exports: [LayoutConfigService],
})
export class LayoutConfigModule {} 