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
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('v1/faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(
    @Body() createFaqDto: CreateFaqDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.faqService.create(createFaqDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: FaqQueryDto) {
    return this.faqService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.faqService.update(id, updateFaqDto, req.user?.id);
  }

  @Patch(':id/trash')
  trash(@Param('id') id: string) {
    return this.faqService.trash(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }

  @Post(':id/qa-pairs')
  addQaPair(
    @Param('id') id: string,
    @Body() qaPair: { question: string; answer: string },
  ) {
    return this.faqService.addQaPair(id, qaPair);
  }

  @Patch(':id/qa-pairs/:qaPairId')
  updateQaPair(
    @Param('id') id: string,
    @Param('qaPairId') qaPairId: string,
    @Body() qaPair: { question: string; answer: string },
  ) {
    return this.faqService.updateQaPair(id, qaPairId, qaPair);
  }

  @Delete(':id/qa-pairs/:qaPairId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQaPair(@Param('id') id: string, @Param('qaPairId') qaPairId: string) {
    return this.faqService.removeQaPair(id, qaPairId);
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.faqService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.faqService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.faqService.permanentlyDelete(id);
  }


}
