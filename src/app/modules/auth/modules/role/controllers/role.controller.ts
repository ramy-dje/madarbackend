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
import { RoleService } from '../services/role.service';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { RoleFilter_ValidationSchema } from '../validations/role-filtering.schema';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import RoleFilteringInterface from '../interfaces/role.filtering';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_RoleInterface,
  Create_RoleInterface,
} from '../interfaces/role.interface';
import { Create_Role_ValidationSchema } from '../validations/create-role.schema';
import { Update_Role_ValidationSchema } from '../validations/update-role.schema';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthRole } from '../../../guards/role.guard';
import {
  CRUDManyIDsValidationSchema,
  CRUDManyIDsValidationSchemaType,
} from 'src/core/validations/crud-many.validation';

@Controller('roles')
export class RoleController {
  constructor(
    @Inject(RoleService)
    private readonly roleService: RoleService,
  ) {}

  // get all roles endpoint (with pagination)
  @Get()
  @UseGuards(AuthGuard, AuthRole([], ['role:read']))
  async get_all_roles(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(RoleFilter_ValidationSchema))
    filters: RoleFilteringInterface,
  ): Promise<PaginatedResponse<Client_RoleInterface>> {
    // getting the roles
    const res = await this.roleService.get_all_roles(
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

  // get a role endpoint
  @Get(':id')
  @UseGuards(AuthGuard, AuthRole([], ['role:read']))
  async get_one_role(
    @Param('id') role_id: string,
  ): Promise<Client_RoleInterface> {
    // getting and returning the role
    return await this.roleService.get_one_role(role_id);
  }

  // create a role endpoint
  @Post()
  @UseGuards(AuthGuard, AuthRole([], ['role:read', 'role:create']))
  async create_role(
    @Body(new ZodValidationPipe(Create_Role_ValidationSchema))
    role: Create_RoleInterface,
  ): Promise<Client_RoleInterface> {
    // creating and returning the new role
    return await this.roleService.create_role(role);
  }

  // update a role endpoint
  @Put(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['role:read', 'role:create', 'role:update']),
  )
  async update_role(
    @Param('id') role_id: string,
    @Body(new ZodValidationPipe(Update_Role_ValidationSchema))
    role: Partial<Create_RoleInterface>,
  ): Promise<Client_RoleInterface> {
    // updating and returning the updated role
    return await this.roleService.update_role(role_id, role);
  }

  // delete many roles
  @Delete('many')
  @UseGuards(AuthGuard, AuthRole([], ['role:read', 'role:delete']))
  async delete_many_roles(
    @Body(new ZodValidationPipe(CRUDManyIDsValidationSchema))
    body: CRUDManyIDsValidationSchemaType,
  ): Promise<any> {
    return await this.roleService.delete_many_roles(body.ids);
  }

  // delete a role endpoint
  @Delete(':id')
  @UseGuards(AuthGuard, AuthRole([], ['role:read', 'role:delete']))
  async delete_role(@Param('id') role_id: string): Promise<string> {
    // deleting and returning a message
    return await this.roleService.delete_role(role_id);
  }
}
