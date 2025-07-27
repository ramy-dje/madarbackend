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
  import { Request } from 'express';
  import { FormSubmissionsService } from './form-submissions.service';
  import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
  
  @Controller('form-submissions')
  export class FormSubmissionsController {
    constructor(private readonly formSubmissionsService: FormSubmissionsService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createFormSubmissionDto: CreateFormSubmissionDto, @Req() req: Request) {
      // Automatically add request metadata
      createFormSubmissionDto.userAgent = req.get('User-Agent');
      createFormSubmissionDto.ipAddress = req.ip || req.connection.remoteAddress;
      
      return this.formSubmissionsService.create(createFormSubmissionDto);
    }
  
    @Get()
    findAll(@Query() query: any) {
      return this.formSubmissionsService.findAll(query.formId, query);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.formSubmissionsService.findOne(id);
    }
  
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
      return this.formSubmissionsService.updateStatus(id, body.status);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
      return this.formSubmissionsService.remove(id);
    }
  
    @Get('form/:formId/stats')
    getStats(@Param('formId') formId: string) {
      return this.formSubmissionsService.getSubmissionStats(formId);
    }
  
    @Get('form/:formId/date-range')
    getByDateRange(
      @Param('formId') formId: string,
      @Query('start') start: string,
      @Query('end') end: string,
    ) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return this.formSubmissionsService.getSubmissionsByDateRange(formId, startDate, endDate);
    }
  }