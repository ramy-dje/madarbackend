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
import { TendersService } from './tenders.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { TenderQueryDto } from './dto/tender-query.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('v1/tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  create(
    @Body() createTenderDto: CreateTenderDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.tendersService.create(createTenderDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: TenderQueryDto) {
    return this.tendersService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTenderDto: UpdateTenderDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.tendersService.update(id, updateTenderDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tendersService.remove(id);
  }



  @Get('active/all')
  findActive() {
    return this.tendersService.findActive();
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.tendersService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.tendersService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.tendersService.permanentlyDelete(id);
  }
}
