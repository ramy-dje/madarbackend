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
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createFormDto: CreateFormDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.formsService.create(createFormDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.formsService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Get('by-name/:name')
  @Public()
  findByName(@Param('name') name: string) {
    return this.formsService.findByName(name);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.formsService.update(id, updateFormDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Body() body: { name: string }) {
    return this.formsService.duplicate(id, body.name);
  }

  @Post(':id/validate')
  @Public()
  validateFormData(@Param('id') id: string, @Body() data: Record<string, any>) {
    return this.formsService.validateFormData(id, data);
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.formsService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.formsService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.formsService.permanentlyDelete(id);
  }
}