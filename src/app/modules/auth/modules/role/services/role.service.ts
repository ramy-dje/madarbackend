import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import RoleInterface, {
  Client_RoleInterface,
  Create_RoleInterface,
  RoleInterfaceDocumentType,
} from '../interfaces/role.interface';
import { CoreService } from 'src/core/services/core.service';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import RoleFilteringInterface from '../interfaces/role.filtering';
import { DefaultSystemRoles } from '../../../roles.constants';
import { UserInterface } from 'src/app/modules/user/interfaces/user.interface';

@Injectable()
export class RoleService implements OnModuleInit {
  // Default Roles IDs
  defaultRolesIDs: Record<string, string> = {};

  // Logger
  logger = new Logger(RoleService.name);

  constructor(
    @InjectModel('Roles') private readonly roleModel: Model<RoleInterface>,
    @InjectModel('Users') private readonly userModel: Model<UserInterface>,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all roles with pagination
  async get_all_roles(
    pagination: PaginationQueryInterface,
    filters: RoleFilteringInterface,
  ): Promise<PaginatedResponse<Client_RoleInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the categories
      const res = await this.roleModel.find(
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
      const total = await this.roleModel.countDocuments({
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

      // returning the roles
      const data = res.map((role) => this.client_convertor(role as any));
      return this.paginationService.createPaginatedResponse(data, total, page, size);
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get_roles_by_ids(ids: string[]): Promise<Client_RoleInterface[]> {
    try {
      // checking the ids
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new HttpException('IDs Are Not Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the roles
      const roles = await this.roleModel.find(
        {
          _id: { $in: ids },
        },
        {
          _id: 1,
          name: 1,
          color: 1,
        },
      );

      // returning the roles
      return roles.map((role) => this.client_convertor(role as any));
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get one role
  async get_one_role(role_id: string): Promise<Client_RoleInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(role_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const role = await this.roleModel.findById(
        role_id,
        {},
        {
          lean: true, // to return lightweight document
        },
      );

      if (!role?._id) {
        throw new HttpException(
          'Role With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning a message
      return this.client_convertor(role as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create a role with permissions
  async create_role(role: Create_RoleInterface): Promise<Client_RoleInterface> {
    try {
      // creating the role
      const new_role = new this.roleModel({
        name: role.name,
        deletable: true, // any which is created by the admin can be deleted except the default roles (Admin,Manager,User)
        color: role.color,
        permissions: role.permissions,
      });

      // saving the document in the db
      const res = await new_role.save();

      // returning the created role
      return this.client_convertor(res as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // update a role and permissions
  async update_role(
    role_id: string,
    role: Partial<Create_RoleInterface>,
  ): Promise<Client_RoleInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(role_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const existed = await this.roleModel.findById(
        role_id,
        {},
        { lean: true },
      );

      if (!existed?._id) {
        throw new HttpException(
          'Role With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // updating the role
      const res = await this.roleModel.findByIdAndUpdate(
        { _id: role_id },
        {
          ...role,
          deletable: true, // to make it deletable
        },
        {
          lean: true, // to return lightweight document
          new: true, // to return the new version of the doc
        },
      );

      // returning the created role
      return this.client_convertor(res as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete a role
  async delete_role(role_id: string): Promise<string> {
    // checking the id
    if (!this.coreService.isValid_ObjectId(role_id)) {
      throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
    }

    // check if it exists
    const existed = await this.roleModel.findById(
      role_id,
      {
        deletable: true, // to see if it's a deletable role
      },
      {
        lean: true, // to return lightweight document
      },
    );

    // throw error if it doesn't exist
    if (!existed?._id) {
      throw new HttpException(
        'Role With This ID Does Not Exist',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if the role is deletable
    if (!existed.deletable) {
      throw new HttpException('CAN NOT DELETE THIS ROLE', HttpStatus.FORBIDDEN);
    }

    // change the users roles who use this role to other role 'User'
    await this.userModel.updateMany(
      { 'access.role': role_id },
      {
        'access.role': this.defaultRolesIDs['User'], // setting it to the 'User' role
      },
    );

    try {
      // deleting the role
      await this.roleModel.deleteOne({
        _id: role_id,
      });

      // returning a message
      return 'Successfully Deleted';
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete many roles
  async delete_many_roles(roles_ids: string[]) {
    try {
      // checking the id

      if (!roles_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // change the users roles who use this role to other role 'User'
      await this.userModel.updateMany(
        {
          'access.role': {
            $in: roles_ids,
          },
          // is not the admin
          'access.isAdmin': {
            $ne: true,
          },
        },
        {
          'access.role': this.defaultRolesIDs['User'], // setting it to the 'User' role
        },
      );

      // delete the roles
      await this.roleModel.deleteMany({
        _id: {
          $in: roles_ids, // delete each doc with id included in the array
        },
        // just the deletable
        deletable: {
          $eq: true,
        },
      });

      return 'Roles Where Deleted Successfully';
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(
          'Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // Private Methods
  private client_convertor(
    document: RoleInterfaceDocumentType,
  ): Client_RoleInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      color: document.color,
      deletable: document.deletable,
      name: document.name,
      permissions: document.permissions,
    };
  }

  // Default Roles Logic

  // on module inti
  async onModuleInit() {
    // log the seed
    this.logger.log('Roles Seed Initialized');
    // checking the default roles
    await this.seedDefaultRoles();
  }

  // Seed Role (Method to see if the default roles (Admin,User,Manager) are existed in the db if not it calls a method to create them)
  private async seedDefaultRoles() {
    try {
      // fetching the roles
      const roles_res = await this.roleModel.find(
        {
          deletable: false, // get all undeletable roles (Admin,User,Manager)
        },
        {},
        { lean: true },
      );
      // check they're not three
      if (roles_res.length != 3) {
        // delete them and re-create them
        // deleting them
        await this.roleModel.deleteMany({
          deletable: false, // get all undeletable roles (Admin,User,Manager)
        });

        // create the roles
        await this.createDefaultRoles();

        return;
      }

      // if they're three
      // storing their IDs
      if (roles_res.length == 3) {
        roles_res.forEach((role) => {
          // storing the roles in defaultRolesIDs
          this.defaultRolesIDs[role.name] = role._id.toString();
        });
      }
    } catch (err) {
      // log the err
      this.logger.log(err);
      return new HttpException(
        'Default Roles Seed Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create the default roles (Method to create the default roles with permissions and store their IDs)
  private async createDefaultRoles() {
    try {
      // create the default roles

      // looping the default roles array
      for (let idx = 0; idx < DefaultSystemRoles.length; idx++) {
        // get role by idx
        const role = DefaultSystemRoles[idx];

        // create role
        const new_role = new this.roleModel({
          color: role.color,
          deletable: false, // to not deletable or changeable
          name: role.name,
          permissions: role.permissions,
        });

        // saving the role
        const saved = await new_role.save();

        // save the new role id
        this.defaultRolesIDs[role.name] = saved._id.toString();
      }
    } catch {
      throw new HttpException(
        'Default Roles Create Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
