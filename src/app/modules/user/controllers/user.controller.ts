import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthenticatedUserRequestInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';
import {
  UpdateUserInterface,
  UpdateUserProfileInterface,
} from '../interfaces/udpate-user.interface';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { UpdateUserValidationSchema } from '../validations/update-user.schema';
import { AuthRole } from '../../auth/guards/role.guard';
import {
  CreateUserValidationSchema,
  CreateUserValidationSchemaType,
} from '../validations/create-user.schema';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import { UserFilter_ValidationSchema } from '../validations/user-filtering.schema';
import UserFilteringInterface from '../interfaces/user.filtering';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_User_Slim_Interface,
  Client_UserInterface,
} from '../interfaces/user.interface';
import {
  UpdateUserActivationValidationSchema,
  UpdateUserActivationValidationSchemaType,
} from '../validations/update-user-activation.schema';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';
import { UpdateUserProfileValidationSchema } from '../validations/update-user-profile.schema';
import {
  CRUDManyIDsValidationSchema,
  CRUDManyIDsValidationSchemaType,
} from 'src/core/validations/crud-many.validation';

@Controller('user')
export class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  // Update the user data (Client Access)
  @Put()
  @UseGuards(AuthGuard, AuthRole([], ['user_client:update']))
  async update_user_profile(
    @Body(new ZodValidationPipe(UpdateUserProfileValidationSchema))
    body: UpdateUserProfileInterface,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    return await this.userService.updateUserProfile(req.user.id, body);
  }

  // get the role and permissions (Client Access)
  @Get('access')
  @UseGuards(AuthGuard, AuthRole([], ['user_client:read']))
  async get_role_and_permissions(
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<
    | {
        role: {
          name: string;
          id: string;
          color: string;
        };
        permissions?: SystemPermissions[];
      }
    | any
  > {
    // return the user access data
    if (req?.user?.access) {
      // returning the just the needed data
      return {
        role: {
          color: req.user.access.role.color,
          name: req.user.access.role.name,
          id: req.user.access.role.id,
        },
        permissions: req.user.access.permissions,
      };
    } else {
      return {};
    }
  }

  // CRUD endpoints
  // get all users endpoint (with pagination) (Admin Only Access)
  @Get()
  @UseGuards(AuthGuard, AuthRole([], ['user:read']))
  async get_all_users(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(UserFilter_ValidationSchema))
    filters: UserFilteringInterface,
  ): Promise<PaginatedResponse<Client_UserInterface>> {
    // getting the blogs
    const res = await this.userService.get_all_users(
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

  @Get('slim')
  @UseGuards(AuthGuard, AuthRole([], []))
  async get_all_users_slime(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(UserFilter_ValidationSchema))
    filters: UserFilteringInterface,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<PaginatedResponse<Client_User_Slim_Interface>> {
    // getting the users
    const res = await this.userService.get_all_users_slim(
      {
        page,
        size,
      },
      filters,
      req.user.id,
    );

    // returning the data with pagination
    return {
      data: res.data,
      page: page,
      total: res.total,
      size: res.data.length,
    };
  }

  // get a user endpoint (Admin Only Access)
  @Get(':id')
  @UseGuards(AuthGuard, AuthRole([], ['user:read']))
  async get_one_user(
    @Param('id') user_id: string,
  ): Promise<Client_UserInterface> {
    // getting and returning the user
    return await this.userService.get_user_by_id(user_id);
  }

  // create user (Admin Only Access)
  @Post()
  @UseGuards(AuthGuard, AuthRole([], ['user:read', 'user:create']))
  async create_user(
    @Body(new ZodValidationPipe(CreateUserValidationSchema))
    body: CreateUserValidationSchemaType,
  ) {
    // create the user and return a message
    return await this.userService.createUser_endpoint(body);
  }

  // Update the user data by id (Admin Only Access)
  @Put(':id')
  @UseGuards(AuthGuard, AuthRole([], ['user:read', 'user:update']))
  async update_user_by_id(
    @Body(new ZodValidationPipe(UpdateUserValidationSchema))
    body: UpdateUserInterface,
    @Param('id') user_id: string,
  ) {
    return await this.userService.updateUser(user_id, body);
  }

  // Update the user active status (Admin Only Access)
  @Patch('activation/:id')
  @UseGuards(AuthGuard, AuthRole([], ['user:read']))
  async update_user_active_by_id(
    @Body(new ZodValidationPipe(UpdateUserActivationValidationSchema))
    body: UpdateUserActivationValidationSchemaType,
    @Param('id') user_id: string,
  ) {
    return await this.userService.updateUserActivation(user_id, body.active);
  }

  // delete many users
  @Delete('many')
  @UseGuards(AuthGuard, AuthRole([], ['user:read', 'user:delete']))
  async delete_many_roles(
    @Body(new ZodValidationPipe(CRUDManyIDsValidationSchema))
    body: CRUDManyIDsValidationSchemaType,
  ): Promise<any> {
    return await this.userService.delete_many_users(body.ids);
  }

  // delete a user endpoint
  @Delete(':id')
  @UseGuards(AuthGuard, AuthRole([], ['user:read', 'user:delete']))
  async delete_role(@Param('id') role_id: string): Promise<string> {
    // deleting and returning a message
    return await this.userService.delete_user(role_id);
  }
}
