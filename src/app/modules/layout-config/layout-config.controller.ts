import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LayoutConfigService } from './layout-config.service';
import { CreateLayoutConfigDto } from './dto/create-layout-config.dto';
import { UpdateLayoutConfigDto } from './dto/update-layout-config.dto';
import { LayoutConfigQueryDto } from './dto/layout-config-query.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthRole } from '../auth/guards/role.guard';
import { Types } from 'mongoose';

@Controller('v1/layout-config')
@UseGuards(AuthGuard, AuthRole([], []))
export class LayoutConfigController {
  constructor(private readonly layoutConfigService: LayoutConfigService) {}

  @Post()
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:create']))
  create(@Body() createLayoutConfigDto: CreateLayoutConfigDto, @Request() req: any) {
    const authorId = new Types.ObjectId(req.user.id);
    return this.layoutConfigService.create(createLayoutConfigDto, authorId);
  }

  @Get()
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  findAll(@Query() query: LayoutConfigQueryDto) {
    return this.layoutConfigService.findAll(query);
  }

  @Get('default')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  getDefaultLayout() {
    return this.layoutConfigService.getDefaultLayout();
  }

  @Get('preview/:contentType')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  getLayoutPreview(@Param('contentType') contentType: string) {
    return this.layoutConfigService.getLayoutPreview(contentType);
  }

  @Get('widget-templates')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  getWidgetTemplates() {
    return this.layoutConfigService.getWidgetTemplates();
  }

  @Get('widgets')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  getWidgets() {
    return this.layoutConfigService.getWidgets();
  }

  @Get(':id')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  findOne(@Param('id') id: string) {
    return this.layoutConfigService.findOne(id);
  }

  @Get('content-type/:contentType')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:read']))
  findByContentType(@Param('contentType') contentType: string) {
    return this.layoutConfigService.findByContentType(contentType);
  }

  @Patch(':id')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:update']))
  update(
    @Param('id') id: string,
    @Body() updateLayoutConfigDto: UpdateLayoutConfigDto,
    @Request() req: any,
  ) {
    const authorId = new Types.ObjectId(req.user.id);
    return this.layoutConfigService.update(id, updateLayoutConfigDto, authorId);
  }

  @Patch(':id/set-default')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:update']))
  setDefault(@Param('id') id: string) {
    return this.layoutConfigService.setDefault(id);
  }

  @Delete(':id')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:delete']))
  remove(@Param('id') id: string) {
    return this.layoutConfigService.remove(id);
  }

  // Widget management endpoints
  @Post('widgets')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:create']))
  createWidget(@Body() widgetData: any, @Request() req: any) {
    const authorId = new Types.ObjectId(req.user.id);
    return this.layoutConfigService.createWidget(widgetData, authorId);
  }

  @Patch('widgets/:id')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:update']))
  updateWidget(@Param('id') id: string, @Body() widgetData: any) {
    return this.layoutConfigService.updateWidget(id, widgetData);
  }

  @Delete('widgets/:id')
  //@UseGuards(AuthGuard, AuthRole([], ['layout_config:delete']))
  deleteWidget(@Param('id') id: string) {
    return this.layoutConfigService.deleteWidget(id);
  }
} 