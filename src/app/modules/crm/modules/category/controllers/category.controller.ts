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
import { CategoryService } from '../services/category.service';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { AuthRole } from 'src/app/modules/auth/guards/role.guard';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import CategoryFilteringInterface from '../interfaces/category.filtering';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_CategoryInterface,
  Create_CategoryInterface,
} from '../interfaces/category.interface';
import { CategoryFilter_ValidationSchema } from '../validations/category-filtering.schema';
import { Create_Category_ValidationSchema } from '../validations/create-category.schema';

@Controller('crm/categories')
export class CategoryController {
  constructor(
    @Inject(CategoryService)
    private readonly categoryService: CategoryService,
  ) {}

  // get all categories endpoint (with pagination)
  @Get()
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_category:read'],
      ['crm_company:read', 'crm_company:create'], // if this user has the permission to create a company
      ['crm_company:read', 'crm_company:update'], // if this user has the permission to update a company
    ),
  )
  async get_all_categories(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(CategoryFilter_ValidationSchema))
    filters: CategoryFilteringInterface,
  ): Promise<PaginatedResponse<Client_CategoryInterface>> {
    // getting the categories
    const res = await this.categoryService.get_all_categories_with_pagination(
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

  // get category by id endpoint
  @Get(':id')
  @UseGuards(
    AuthGuard,
    AuthRole(
      [],
      ['crm_category:read'],
      ['crm_company:read', 'crm_company:create'], // if this user has the permission to create a company
      ['crm_company:read', 'crm_company:update'], // if this user has the permission to update a company
    ),
  )
  async get_category_by_id(
    @Param('id') category_id: string,
  ): Promise<Client_CategoryInterface> {
    // getting and returning the category
    return await this.categoryService.get_category_by_id(category_id);
  }

  // create a category endpoint
  @Post()
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_category:read', 'crm_category:create']),
  )
  async create_category(
    @Body(new ZodValidationPipe(Create_Category_ValidationSchema))
    category: Create_CategoryInterface,
  ): Promise<Client_CategoryInterface> {
    // creating and returning the new category
    return await this.categoryService.create_category(category);
  }

  // delete category by id endpoint
  @Delete(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_category:read', 'crm_category:delete']),
  )
  async delete_category(@Param('id') category_id: string): Promise<string> {
    // deleting and returning a message
    return await this.categoryService.delete_category(category_id);
  }
}
