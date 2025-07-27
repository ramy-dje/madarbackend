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
import { OccupationService } from '../services/occupation.service';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import { OccupationFilter_ValidationSchema } from '../validations/occupation-filtering.schema';
import OccupationFilteringInterface from '../interfaces/occupation.filtering';
import {
  Client_OccupationInterface,
  Create_OccupationInterface,
} from '../interfaces/occupation.interface';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { Create_Occupation_ValidationSchema } from '../validations/create-occupation.schema';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { AuthRole } from 'src/app/modules/auth/guards/role.guard';

@Controller('crm/occupations')
export class OccupationController {
  constructor(
    @Inject(OccupationService)
    private readonly occupationService: OccupationService,
  ) {}

  // get all occupations endpoint (with pagination)
  @Get()
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_occupation:read'],
      ['crm_contacts:read', 'crm_contacts:create'], // if this user has the permission to create a contact
      ['crm_contacts:read', 'crm_contacts:update'], // if this user has the permission to update a contact
    ),
  )
  async get_all_occupations(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(OccupationFilter_ValidationSchema))
    filters: OccupationFilteringInterface,
  ): Promise<PaginatedResponse<Client_OccupationInterface>> {
    // getting the occupations
    const res =
      await this.occupationService.get_all_occupations_with_pagination(
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

  // get occupation by id endpoint
  @Get(':id')
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_occupation:read'],
      ['crm_contacts:read', 'crm_contacts:create'], // if this user has the permission to create a contact
      ['crm_contacts:read', 'crm_contacts:update'], // if this user has the permission to update a contact
    ),
  )
  async get_occupation_by_id(
    @Param('id') occupation_id: string,
  ): Promise<Client_OccupationInterface> {
    // getting and returning the occupation
    return await this.occupationService.get_occupation_by_id(occupation_id);
  }

  // create a occupation endpoint
  @Post()
  @Post()
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_occupation:read', 'crm_occupation:create']),
  )
  async create_occupation(
    @Body(new ZodValidationPipe(Create_Occupation_ValidationSchema))
    occupation: Create_OccupationInterface,
  ): Promise<Client_OccupationInterface> {
    // creating and returning the new occupation
    return await this.occupationService.create_occupation(occupation);
  }

  // delete occupation by id endpoint
  @Delete(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_occupation:read', 'crm_occupation:delete']),
  )
  async delete_occupation(@Param('id') occupation_id: string): Promise<string> {
    // deleting and returning a message
    return await this.occupationService.delete_occupation(occupation_id);
  }
}
