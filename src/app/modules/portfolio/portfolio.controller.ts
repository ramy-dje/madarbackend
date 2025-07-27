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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto, PortfolioLanguage } from './dto/portfolio-query.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('v1/portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.portfolioService.create(createPortfolioDto, req.user?.id);
  }

  @Get()
  @Public()
  findAll(@Query() query: PortfolioQueryDto) {
    return this.portfolioService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(
    @Param('id') id: string,
    @Query('language') language?: PortfolioLanguage,
  ) {
    return this.portfolioService.findOne(id, language);
  }

  @Get(':id/:language')
  @Public()
  findOneInLanguage(
    @Param('id') id: string,
    @Param('language') language: PortfolioLanguage,
  ) {
    return this.portfolioService.getContentInLanguage(id, language);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }

  // Trash Management Endpoints
  @Get('trash')
  findTrashed() {
    return this.portfolioService.findTrashed();
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.portfolioService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyDelete(@Param('id') id: string) {
    return this.portfolioService.permanentlyDelete(id);
  }
}
