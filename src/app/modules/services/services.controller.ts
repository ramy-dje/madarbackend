import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto, ServiceLanguage } from './dto/service-query.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { Service } from './schemas/service.schema';

@Controller('v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.servicesService.create(createServiceDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: ServiceQueryDto): Promise<PaginatedResponse<Service>> {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(
    @Param('id') id: string,
    @Query('language') language?: ServiceLanguage,
  ) {
    return this.servicesService.findOne(id, language);
  }

  @Get(':id/:language')
  @Public()
  findOneInLanguage(
    @Param('id') id: string,
    @Param('language') language: ServiceLanguage,
  ) {
    return this.servicesService.getContentInLanguage(id, language);
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.servicesService.update(id, updateServiceDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }





  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.servicesService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.servicesService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.servicesService.permanentlyDelete(id);
  }
}
