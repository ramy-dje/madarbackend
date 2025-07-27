import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CoreService } from 'src/core/services/core.service';
import IndustryInterface, {
  Client_IndustryInterface,
  Create_IndustryInterface,
  IndustryInterfaceDocumentType,
} from '../interfaces/industry.interface';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import IndustryFilteringInterface from '../interfaces/industry.filtering';

@Injectable()
export class IndustryService {
  constructor(
    @InjectModel('CRM_Industries')
    private readonly industryModel: Model<IndustryInterface>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all industries with pagination
  async get_all_industries_with_pagination(
    pagination: PaginationQueryInterface,
    filters: IndustryFilteringInterface,
  ): Promise<PaginatedResponse<Client_IndustryInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the industries
      const res = await this.industryModel.find(
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
      const total = await this.industryModel.countDocuments({
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

      // returning the industries
      const data = res.map((industry) => this.client_convertor(industry as any));
      return this.paginationService.createPaginatedResponse(data, total, page, size);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get industry by id
  async get_industry_by_id(
    industry_id: string,
  ): Promise<Client_IndustryInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(industry_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the industry
      const res = await this.industryModel.findById(
        industry_id,
        {},
        {
          lean: true, // to return lightweight document
        },
      );

      //  check if it exists
      if (!res?._id) {
        throw new HttpException(
          'Industry With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the industry
      return this.client_convertor(res as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // add industry (method to check if the industry exists and create it if it does't exist)
  async addIndustry(industry_name: string) {
    try {
      // check there's an industry with this name
      const exited_industry = await this.industryModel.findOne(
        {
          name: industry_name,
        },
        {},
        {
          lean: true, // for lightweight document
        },
      );

      // if exists
      if (exited_industry?._id) {
        // returning the industry
        return this.client_convertor(exited_industry as any);
      }

      // create one if this industry with this name does't exist

      const new_industry = new this.industryModel({
        name: industry_name,
      });

      // saving the new_industry in the db
      const save_res = await new_industry.save();

      // returning the new industry
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create industry
  async create_industry(industry: Create_IndustryInterface) {
    try {
      // create industry

      const new_industry = new this.industryModel({
        name: industry.name,
      });

      // saving the new_industry in the db
      const save_res = await new_industry.save();

      // returning the new industry
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete industry
  async delete_industry(industry_id: string): Promise<string> {
    // checking the id
    if (!this.coreService.isValid_ObjectId(industry_id)) {
      throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
    }

    // check if it exists
    const existed = await this.industryModel.exists({
      _id: industry_id,
    });

    if (!existed?._id) {
      throw new HttpException(
        'Industry With This ID Does Not Exist',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // deleting the industry
      await this.industryModel.deleteOne({ _id: industry_id });
      // returning a message
      return 'Successfully Deleted';
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Private Methods
  private client_convertor(
    document: IndustryInterfaceDocumentType,
  ): Client_IndustryInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      name: document.name,
    };
  }
}
