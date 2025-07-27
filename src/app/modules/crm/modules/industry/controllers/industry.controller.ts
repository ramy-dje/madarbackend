import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndustryService } from '../services/industry.service';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import { IndustryFilter_ValidationSchema } from '../validations/industry-filtering.schema';
import IndustryFilteringInterface from '../interfaces/industry.filtering';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_IndustryInterface,
  Create_IndustryInterface,
} from '../interfaces/industry.interface';
import { Create_Industry_ValidationSchema } from '../validations/create-industry.schema';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { AuthRole } from 'src/app/modules/auth/guards/role.guard';

@Controller('crm/industries')
export class IndustryController {
  constructor(
    @Inject(IndustryService)
    private readonly industryService: IndustryService,
  ) {}

  // get all industries endpoint (with pagination)
  @Get()
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_industry:read'],
      ['crm_contacts:read', 'crm_contacts:create'], // if this user has the permission to create a contact
      ['crm_contacts:read', 'crm_contacts:update'], // if this user has the permission to update a contact
      ['crm_company:read', 'crm_company:create'], // if this user has the permission to create a company
      ['crm_company:read', 'crm_company:update'], // if this user has the permission to update a company
    ),
  )
  async get_all_industries(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(IndustryFilter_ValidationSchema))
    filters: IndustryFilteringInterface,
  ): Promise<PaginatedResponse<Client_IndustryInterface>> {
    // getting the industries
    const res = await this.industryService.get_all_industries_with_pagination(
      {
        page,
        size,
      },
      filters,
    );

    // returning the data with pagination
    return {
      data: res.data,
      page: page,
      total: res.total,
      size: res.data.length,
    };
  }

  // get industry by id endpoint
  @Get(':id')
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_industry:read'],
      ['crm_contacts:read', 'crm_contacts:create'], // if this user has the permission to create a contact
      ['crm_contacts:read', 'crm_contacts:update'], // if this user has the permission to update a contact
      ['crm_company:read', 'crm_company:create'], // if this user has the permission to create a company
      ['crm_company:read', 'crm_company:update'], // if this user has the permission to update a company
    ),
  )
  async get_industry_by_id(
    @Param('id') industry_id: string,
  ): Promise<Client_IndustryInterface> {
    // getting and returning the industry
    return await this.industryService.get_industry_by_id(industry_id);
  }

  // create a industry endpoint
  @Post()
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_industry:read', 'crm_industry:create']),
  )
  async create_industry(
    @Body(new ZodValidationPipe(Create_Industry_ValidationSchema))
    industry: Create_IndustryInterface,
  ): Promise<Client_IndustryInterface> {
    // creating and returning the new industry
    return await this.industryService.create_industry(industry);
  }

  // delete industry by id endpoint
  @Delete(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_industry:read', 'crm_industry:delete']),
  )
  async delete_industry(@Param('id') industry_id: string): Promise<string> {
    // deleting and returning a message
    return await this.industryService.delete_industry(industry_id);
  }
}
