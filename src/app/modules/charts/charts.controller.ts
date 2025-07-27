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
import { ChartsService } from './charts.service';
import { CreateChartDto } from './dto/create-chart.dto';
import { UpdateChartDto } from './dto/update-chart.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('v1/charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Post()
  create(
    @Body() createChartDto: CreateChartDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.chartsService.create(createChartDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.chartsService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.chartsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChartDto: UpdateChartDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.chartsService.update(id, updateChartDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.chartsService.remove(id);
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.chartsService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.chartsService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.chartsService.permanentlyDelete(id);
  }
}
