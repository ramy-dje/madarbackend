import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import CompanyFilteringInterface from '../interfaces/company.filtering';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_CompanyInterface,
  Create_CompanyInterface,
} from '../interfaces/company.interface';
import { CompanyFilter_ValidationSchema } from '../validations/company-filtering.schema';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { AuthRole } from 'src/app/modules/auth/guards/role.guard';
import { Create_Company_ValidationSchema } from '../validations/create-company.schema';

import {
  CRUDManyIDsValidationSchema,
  CRUDManyIDsValidationSchemaType,
} from 'src/core/validations/crud-many.validation';
import { Update_Company_ValidationSchema } from '../validations/update-company.schema';
import SimpleCRUDResponseType from 'src/core/interfaces/simple-response.interface';

@Controller('crm/companies')
export class CompanyController {
  constructor(
    @Inject(CompanyService)
    private readonly companyService: CompanyService,
  ) {}

  // get all CRM companies endpoint (with pagination)
  @Get()
  @UseGuards(AuthGuard, AuthRole([], ['crm_company:read']))
  async get_all_companies(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(CompanyFilter_ValidationSchema))
    filters: CompanyFilteringInterface,
  ): Promise<PaginatedResponse<Client_CompanyInterface>> {
    // getting all the companies with pagination
    const res = await this.companyService.get_all_companies(
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

  // get a company endpoint
  @Get(':id')
  @UseGuards(AuthGuard, AuthRole([], ['crm_company:read']))
  async get_company_by_id(
    @Param('id') company_id: string,
  ): Promise<Client_CompanyInterface> {
    // getting and returning the company
    return await this.companyService.get_company_by_id(company_id);
  }

  // create a contact endpoint
  @Post()
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_company:read', 'crm_company:create']),
  )
  async create_company(
    @Body(new ZodValidationPipe(Create_Company_ValidationSchema))
    company: Create_CompanyInterface,
  ): Promise<SimpleCRUDResponseType> {
    // creating and returning the created company
    return await this.companyService.create_company(company);
  }

  // update a contact by id endpoint
  @Put(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_company:read', 'crm_company:update']),
  )
  async update_company_by_id(
    @Param('id') company_id: string,
    @Body(new ZodValidationPipe(Update_Company_ValidationSchema))
    company: Partial<Create_CompanyInterface>,
  ): Promise<SimpleCRUDResponseType> {
    // updating and returning the updated company
    return await this.companyService.update_company(company_id, company);
  }

  // delete many contacts
  @Delete('many')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_company:read', 'crm_company:delete']),
  )
  async delete_many_companies(
    @Body(new ZodValidationPipe(CRUDManyIDsValidationSchema))
    body: CRUDManyIDsValidationSchemaType,
  ): Promise<any> {
    return await this.companyService.delete_many_companies(body.ids);
  }

  // delete a company endpoint
  @Delete(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_company:read', 'crm_company:delete']),
  )
  async delete_company_by_id(
    @Param('id') company_id: string,
  ): Promise<SimpleCRUDResponseType> {
    // deleting and returning a message
    return await this.companyService.delete_company(company_id);
  }
}
