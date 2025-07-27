import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CategoryInterface, {
  CategoryInterfaceDocumentType,
  Client_CategoryInterface,
  Create_CategoryInterface,
} from '../interfaces/category.interface';
import { CoreService } from 'src/core/services/core.service';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import CategoryFilteringInterface from '../interfaces/category.filtering';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('CRM_Categories')
    private readonly categoryModel: Model<CategoryInterface>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all categories with pagination
  async get_all_categories_with_pagination(
    pagination: PaginationQueryInterface,
    filters: CategoryFilteringInterface,
  ): Promise<PaginatedResponse<Client_CategoryInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the categories
      const res = await this.categoryModel.find(
        {
          // filters (name filtering)
          ...(filters.name
            ? {
                name: {
                  $regex: RegExp(
                    `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),
        },
        {},
        {
          // pagination
          skip: skip,
          limit: size,
          lean: true, // to return lightweight document
          sort: {
            // sorting by latest by default
            createdAt: filters.sorting_by_date_date == '1' ? 1 : -1,
          },
        },
      );

      // getting the total of the data
      const total = await this.categoryModel.countDocuments({
        // filters (name filtering)
        ...(filters.name
          ? {
              name: {
                $regex: RegExp(
                  `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),
      });

      // returning the occupations
      const data = res.map((occupation) => this.client_convertor(occupation as any));
      return this.paginationService.createPaginatedResponse(data, total, page, size);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get category by id
  async get_category_by_id(
    category_id: string,
  ): Promise<Client_CategoryInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(category_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the category
      const res = await this.categoryModel.findById(
        category_id,
        {},
        {
          lean: true, // to return lightweight document
        },
      );

      //  check if it exists
      if (!res?._id) {
        throw new HttpException(
          'Category With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the category
      return this.client_convertor(res as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // add category (method to check if the category exists and create it if it does't exist)
  async addCategory(category_name: string) {
    try {
      // check there's an category with this name
      const exited_category = await this.categoryModel.findOne(
        {
          name: category_name,
        },
        {},
        {
          lean: true, // for lightweight document
        },
      );

      // if exists
      if (exited_category?._id) {
        // returning the category
        return this.client_convertor(exited_category as any);
      }

      // create one if this category with this name does't exist

      const new_category = new this.categoryModel({
        name: category_name,
      });

      // saving the new_category in the db
      const save_res = await new_category.save();

      // returning the new category
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create category
  async create_category(category: Create_CategoryInterface) {
    try {
      // create category
      const new_category = new this.categoryModel({
        name: category.name,
      });

      // saving the new_category in the db
      const save_res = await new_category.save();

      // returning the new category
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete category
  async delete_category(category_id: string): Promise<string> {
    // checking the id
    if (!this.coreService.isValid_ObjectId(category_id)) {
      throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
    }

    // check if it exists
    const existed = await this.categoryModel.exists({
      _id: category_id,
    });

    if (!existed?._id) {
      throw new HttpException(
        'Category With This ID Does Not Exist',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // deleting the category
      await this.categoryModel.deleteOne({ _id: category_id });
      // returning a message
      return 'Successfully Deleted';
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Private Methods
  private client_convertor(
    document: CategoryInterfaceDocumentType,
  ): Client_CategoryInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      name: document.name,
    };
  }
}
