import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OccupationInterface, {
  Client_OccupationInterface,
  Create_OccupationInterface,
  OccupationInterfaceDocumentType,
} from '../interfaces/occupation.interface';
import { CoreService } from 'src/core/services/core.service';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import OccupationFilteringInterface from '../interfaces/occupation.filtering';

@Injectable()
export class OccupationService {
  constructor(
    @InjectModel('CRM_Occupations')
    private readonly occupationModel: Model<OccupationInterface>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all occupations with pagination
  async get_all_occupations_with_pagination(
    pagination: PaginationQueryInterface,
    filters: OccupationFilteringInterface,
  ): Promise<PaginatedResponse<Client_OccupationInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the occupations
      const res = await this.occupationModel.find(
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
      const total = await this.occupationModel.countDocuments({
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

  // Get occupation by id
  async get_occupation_by_id(
    occupation_id: string,
  ): Promise<Client_OccupationInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(occupation_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the occupation
      const res = await this.occupationModel.findById(
        occupation_id,
        {},
        {
          lean: true, // to return lightweight document
        },
      );

      //  check if it exists
      if (!res?._id) {
        throw new HttpException(
          'Occupation With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the occupation
      return this.client_convertor(res as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // add occupation (method to check if the occupation exists and create it if it does't exist)
  async addOccupation(occupation_name: string) {
    try {
      // check there's an occupation with this name
      const exited_occupation = await this.occupationModel.findOne(
        {
          name: occupation_name,
        },
        {},
        {
          lean: true, // for lightweight document
        },
      );

      // if exists
      if (exited_occupation?._id) {
        // returning the occupation
        return this.client_convertor(exited_occupation as any);
      }

      // create one if this occupation with this name does't exist

      const new_occupation = new this.occupationModel({
        name: occupation_name,
      });

      // saving the new_occupation in the db
      const save_res = await new_occupation.save();

      // returning the new occupation
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create occupation
  async create_occupation(occupation: Create_OccupationInterface) {
    try {
      // create occupation

      const new_occupation = new this.occupationModel({
        name: occupation.name,
      });

      // saving the new_occupation in the db
      const save_res = await new_occupation.save();

      // returning the new occupation
      return this.client_convertor(save_res as any);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete occupation
  async delete_occupation(occupation_id: string): Promise<string> {
    // checking the id
    if (!this.coreService.isValid_ObjectId(occupation_id)) {
      throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
    }

    // check if it exists
    const existed = await this.occupationModel.exists({
      _id: occupation_id,
    });

    if (!existed?._id) {
      throw new HttpException(
        'Occupation With This ID Does Not Exist',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // deleting the occupation
      await this.occupationModel.deleteOne({ _id: occupation_id });
      // returning a message
      return 'Successfully Deleted';
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Private Methods
  private client_convertor(
    document: OccupationInterfaceDocumentType,
  ): Client_OccupationInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      name: document.name,
    };
  }
}
