import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcryptjs';
import {
  Client_User_Slim_Interface,
  Client_UserInterface,
  UserInterface,
  UserSchemaDocumentType,
} from '../interfaces/user.interface';
import { CreateUserInterface } from '../interfaces/create-user.interface';
import {
  UpdateUserInterface,
  UpdateUserProfileInterface,
} from '../interfaces/udpate-user.interface';
import { RoleService } from '../../auth/modules/role/services/role.service';
import { CreateUserValidationSchemaType } from '../validations/create-user.schema';
import { RoleInterfaceDocumentType } from '../../auth/modules/role/interfaces/role.interface';
import UserFilteringInterface from '../interfaces/user.filtering';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { CoreService } from 'src/core/services/core.service';
import { PaginationService } from 'src/core/services/pagination.service';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';
import { CRMService } from '../../crm/services/crm.service';
import { StorageService } from '../../storage/services/storage.service';
import SimpleCRUDResponseType from 'src/core/interfaces/simple-response.interface';

@Injectable()
export class UserService implements OnModuleInit {
  // Logger
  logger = new Logger(UserService.name);
  // Injecting the Users model
  constructor(
    @InjectModel('Users') private UserModel: Model<UserInterface>,
    @Inject(RoleService) private readonly roleService: RoleService,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
    @Inject(CRMService) private readonly crmService: CRMService,
    @Inject(forwardRef(() => StorageService))
    private readonly storageService: StorageService,
  ) {}

  // Create User
  async createUser(
    user: CreateUserInterface,
    withContact?: boolean, // for creating the contact with the user
    role_id?: string,
  ): Promise<CreateUserInterface & { id: string }> {
    // verify if the email is taken
    const isEmailTaken = await this.IsEmailTaken(user.email);
    if (isEmailTaken) {
      throw new HttpException('Email is already taken', HttpStatus.CONFLICT);
    }
    try {
      // encrypting the password
      const encryptedPassword = user.oauth ? '' : await hash(user.password, 10);
      // the user model
      const newUser = new this.UserModel({
        profileInfo: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          pic: user.pic || '',
          gender: user.gender || 'male',
          phoneNumber: user.phoneNumbers,
          location: {
            country: user.location.country,
            state: user.location.state,
            city: user.location.city,
            zipcode: user.location.zipcode,
          },
        },
        access: {
          role: role_id
            ? role_id
            : (this.roleService.defaultRolesIDs['User'] as string), // the user role
          oauth: user.oauth,
          oauthProvider: user.oauthProvider || '',
          active: true,
          verified: false,
          ...{ ...(!user.oauth ? { password: encryptedPassword } : {}) },
        },
      });
      //  creating the user
      const res = await newUser.save();

      // creating the contact if the withContact is 'true'
      if (withContact) {
        await this.crmService.add_contact({
          // access ref
          access: res._id.toString(),
          // info
          bio: '',
          emails: [user.email],
          // phone numbers
          phoneNumbers: {
            fax: [],
            mobile: user.phoneNumbers,
            viber: [],
            whatsapp: [],
          },
          resource: 'Website Registeration',
          // work
          work: {},
          // personal info
          personalInfo: {
            firstName: user.fullName,
            lastName: user.fullName,
            gender: user.gender || 'male',
            location: {
              country: user.location.country,
              state: user.location.state,
              city: user.location.city,
              zipcode: user.location.zipcode,
            },
            pic: user.pic || '',
          },
          // social media
          socialMedia: {
            facebook: [],
            instagram: [],
            linkedin: [],
            other: [],
            pinterest: [],
            reddit: [],
            snapchat: [],
            telegram: [],
            tiktok: [],
            twitch: [],
            twitter: [],
            youtube: [],
          },
        });
      }

      return {
        id: res._id.toString(),
        username: res.profileInfo.username,
        email: res.profileInfo.email,
        fullName: res.profileInfo.fullName,
        pic: res.profileInfo.pic,
        gender: res.profileInfo.gender,
        phoneNumbers: res.profileInfo.phoneNumber,
        location: res.profileInfo.location,
        password: res.access.password,
        oauth: res.access.oauth,
        oauthProvider: res.access.oauthProvider,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update The User Data (full info access e.x role)
  async updateUser(
    user_id: string,
    user: UpdateUserInterface,
  ): Promise<SimpleCRUDResponseType> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // get the user
      const current_user = await this.UserModel.exists({
        _id: user_id,
      });

      if (!current_user?._id) {
        throw new HttpException('User Dos Not Exist', HttpStatus.NOT_FOUND);
      }

      // check if the passwords has been updated
      if (user?.password) {
        // encrypting the password
        const encryptedPassword = await hash(user.password, 10);
        user.password = encryptedPassword;
      }

      // Update the user data
      await this.UserModel.updateOne(
        { _id: user_id },
        {
          'profileInfo.username': user?.username,
          'profileInfo.fullName': user?.fullName,
          'profileInfo.phoneNumber': user?.phoneNumbers,
          'profileInfo.pic': user?.pic,
          'profileInfo.gender': user?.gender,
          'profileInfo.location.country': user?.location?.country,
          'profileInfo.location.state': user?.location?.state,
          'profileInfo.location.city': user?.location?.city,
          'profileInfo.location.zipcode': user?.location?.zipcode,
          'access.password': user?.password,
          'access.role': user?.role,
        },
      );

      return { id: user_id, message: 'Updated Successfully' };
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

  // get user emails by ids
  async get_user_emails_by_ids(user_ids: string[]): Promise<string[]> {
    try {
      // checking the ids
      if (!user_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the users
      const users = await this.UserModel.find(
        {
          _id: {
            $in: user_ids,
          },
        },
        {
          'profileInfo.email': true,
        },
        {
          lean: true, // lightweight document
        },
      );

      // returning the emails
      return users.map((e) => e.profileInfo.email);
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

  async get_user_info_by_ids(
    user_ids: string[],
  ): Promise<{ id: string; fullName: string; pic: string }[]> {
    try {
      // checking the ids
      if (!user_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the users
      const users = await this.UserModel.find(
        {
          _id: {
            $in: user_ids,
          },
        },
        {
          'profileInfo.fullName': true,
          'profileInfo.pic': true,
        },
        {
          lean: true, // lightweight document
        },
      );

      // returning the emails
      return users.map((e) => ({
        id: e._id.toString(),
        fullName: e.profileInfo.fullName,
        pic: e.profileInfo.pic,
      }));
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

  // Update The User Data (To Update just the profile info)
  async updateUserProfile(user_id: string, user: UpdateUserProfileInterface) {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // get the user
      const current_user = await this.UserModel.exists({
        _id: user_id,
      });

      if (!current_user?._id) {
        throw new HttpException('User Dos Not Exist', HttpStatus.NOT_FOUND);
      }

      // check if the passwords has been updated
      if (user?.password) {
        // encrypting the password
        const encryptedPassword = await hash(user.password, 10);
        user.password = encryptedPassword;
      }

      // Update the user data
      await this.UserModel.updateOne(
        { _id: user_id },
        {
          'profileInfo.username': user?.username,
          'profileInfo.fullName': user?.fullName,
          'profileInfo.pic': user?.pic,
          'profileInfo.phoneNumber': user?.phoneNumbers,
          'profileInfo.gender': user?.gender,
          'profileInfo.location.country': user?.location?.country,
          'profileInfo.location.state': user?.location?.state,
          'profileInfo.location.city': user?.location?.city,
          'profileInfo.location.zipcode': user?.location?.zipcode,
          'access.password': user?.password,
        },
      );

      return 'Updated Successfully';
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

  // Update The User Active Status Data
  async updateUserActivation(user_id: string, active: boolean) {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // get the user
      const current_user = await this.UserModel.exists({
        _id: user_id,
        // to get just non-admin user
        'access.isAdmin': {
          $ne: true,
        },
      });

      if (!current_user?._id) {
        throw new HttpException('User Dos Not Exist', HttpStatus.NOT_FOUND);
      }

      // Update the user data
      await this.UserModel.updateOne(
        {
          _id: user_id,
          // to edit just non-admin user
          'access.isAdmin': {
            $ne: true,
          },
        },
        {
          'access.active': active,
        },
      );

      return 'Status Updated Successfully';
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

  // Get User
  async getUserByEmail(
    email: string,
  ): Promise<UserSchemaDocumentType | undefined> {
    try {
      return (
        (await this.UserModel.findOne(
          { 'profileInfo.email': email },
          {},
          {
            // populate the role
            populate: 'access.role',
            lean: true,
          },
        )) || (undefined as any)
      );
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //  (For Endpoints)

  // get all users with pagination
  async get_all_users(
    pagination: PaginationQueryInterface,
    filters: UserFilteringInterface,
  ): Promise<PaginatedResponse<Client_UserInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the categories
      const res = await this.UserModel.find(
        {
          // filters (name filtering)
          ...(filters.name
            ? {
                $or: [
                  {
                    'profileInfo.username': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'profileInfo.fullName': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'profileInfo.email': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                ],
              }
            : {}),

          // filters (role id filtering)
          ...(filters.role_id
            ? {
                'access.role': filters.role_id,
              }
            : {}),

          // filters (gender filtering)
          ...(filters.gender
            ? {
                'profileInfo.gender': filters.gender,
              }
            : {}),
        },
        {},
        {
          // populate the role
          populate: 'access.role',
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
      const total = await this.UserModel.countDocuments({
        // filters (name filtering)
        ...(filters.name
          ? {
              $or: [
                {
                  'profileInfo.username': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'profileInfo.fullName': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'profileInfo.email': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
              ],
            }
          : {}),

        // filters (role id filtering)
        ...(filters.role_id
          ? {
              'access.role': filters.role_id,
            }
          : {}),

        // filters (gender filtering)
        ...(filters.gender
          ? {
              'profileInfo.gender': filters.gender,
            }
          : {}),
      });

      // returning the users
      const data = res.map((user) => this.client_convertor(user as any));
      return this.paginationService.createPaginatedResponse(data, total, page, size);
    } catch (err) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get_all_users_slim(
    pagination: PaginationQueryInterface,
    filters: UserFilteringInterface,
    user_id?: string,
  ): Promise<PaginatedResponse<Client_User_Slim_Interface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // Build filter query
      const filterQuery = {
        // Exclude the current user if user_id is provided
        ...(user_id
          ? {
              _id: {
                $ne: user_id,
              },
            }
          : {}),

        // filters (name filtering)
        ...(filters.name
          ? {
              $or: [
                {
                  'profileInfo.username': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'profileInfo.fullName': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'profileInfo.email': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
              ],
            }
          : {}),

        // filters (role id filtering)
        ...(filters.role_id
          ? {
              'access.role': filters.role_id,
            }
          : {}),

        // filters (gender filtering)
        ...(filters.gender
          ? {
              'profileInfo.gender': filters.gender,
            }
          : {}),
      };

      // Fetch only the required fields for slim version
      const users = await this.UserModel.find(
        filterQuery,
        {
          'profileInfo.pic': 1,
          'profileInfo.username': 1,
          'profileInfo.email': 1,
          'profileInfo.fullName': 1,
        },
        {
          skip: skip,
          limit: size,
          lean: true,
          sort: {
            createdAt: filters.sorting_by_date_date == '1' ? 1 : -1,
          },
        },
      );

      // Get total count
      const total = await this.UserModel.countDocuments(filterQuery);

      // Map to slim interface
      const slimUsers: Client_User_Slim_Interface[] = users.map((user) => ({
        id: user._id.toString(),
        profileInfo: {
          pic: user.profileInfo.pic,
          username: user.profileInfo.username,
          email: user.profileInfo.email,
          fullName: user.profileInfo.fullName,
        },
      }));

      return this.paginationService.createPaginatedResponse(slimUsers, total, page, size);
    } catch (err) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get one user
  async get_user_by_id(user_id: string): Promise<Client_UserInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const user = await this.UserModel.findById(
        user_id,
        {},
        {
          populate: 'access.role', // populate the role
          lean: true, // to return lightweight document
        },
      );

      if (!user?._id) {
        throw new HttpException(
          'User With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the user
      return this.client_convertor(user as any);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get user's permissions
  async get_user_permissions(user_id: string): Promise<{
    role: {
      name: string;
      id: string;
      color: string;
    };
    active: boolean;
    permissions: SystemPermissions[];
  }> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const user = await this.UserModel.findById(
        user_id,
        {
          access: true, // get just the access data
        },
        {
          populate: 'access.role', // populate the role
          lean: true, // to return lightweight document
        },
      );

      if (!user?._id) {
        throw new HttpException(
          'User With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the user
      return {
        permissions: (user.access.role as any as RoleInterfaceDocumentType)
          .permissions as SystemPermissions[],
        active: user.access.active || false,
        role: {
          color: (user.access.role as any as RoleInterfaceDocumentType).color,
          id: (
            user.access.role as any as RoleInterfaceDocumentType
          )._id.toString(),
          name: (user.access.role as any as RoleInterfaceDocumentType).name,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // create user
  async createUser_endpoint(
    body: CreateUserValidationSchemaType,
  ): Promise<SimpleCRUDResponseType> {
    try {
      // create the user
      const res = await this.createUser(
        {
          email: body.email,
          fullName: body.fullName,
          username: body.username,
          gender: body.gender || 'male',
          location: {
            city: body?.location.city || '',
            country: body?.location.country || '',
            state: body?.location.state || '',
            zipcode: body?.location.zipcode || '',
          },
          phoneNumbers: body.phoneNumbers,
          oauth: false,
          password: body.password,
          pic: body.pic,
        },
        false,
        body.role,
      );

      return { id: res.id, message: 'User Created Successfully' };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete user
  async delete_user(user_id: string): Promise<string> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(user_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const existed = await this.UserModel.findOne(
        {
          _id: user_id,
        },
        {
          'profileInfo.pic': true, // to delete it
          'access.isAdmin': true, // get the the access.isAdmin info
        },
        {
          lean: true, // lightweight document
        },
      );

      // if it dons't exist
      if (!existed?._id) {
        throw new HttpException(
          'User With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if the user is the admin
      if (existed.access.isAdmin) {
        throw new HttpException(
          'CAN NOT DELETE THIS USER',
          HttpStatus.FORBIDDEN,
        );
      }

      // deleting the blog
      await this.UserModel.deleteOne({ _id: user_id });

      // delete the image of the user
      await this.storageService.deleteObjectByPublicURL(
        existed.profileInfo.pic,
      );

      // returning a message
      return 'Successfully Deleted';
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete many users
  async delete_many_users(users_ids: string[]) {
    try {
      // checking the ids
      if (!users_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // getting the users (to delete the images)
      const users = await this.UserModel.find(
        {
          _id: {
            $in: users_ids,
          },
          // to get just the non-admin users
          'access.isAdmin': {
            $ne: true,
          },
        },
        {
          'profileInfo.pic': true, // to delete it
        },
        {
          lean: true, // lightweight document
        },
      );

      // delete the users
      await this.UserModel.deleteMany({
        _id: {
          $in: users_ids, // delete each doc with id included in the array
        },
        // is not the admin (to delete just the users who aren't admins)
        'access.isAdmin': {
          $ne: true,
        },
      });

      // delete the images
      await this.storageService.deleteManyObjectsByPublicURLs([
        ...users.map((e) => e.profileInfo.pic),
      ]);

      return 'Users Where Deleted Successfully';
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

  // Private methods

  // Is email taken
  private async IsEmailTaken(email: string): Promise<boolean> {
    try {
      const user = await this.UserModel.exists({ 'profileInfo.email': email });
      return user._id ? true : false;
    } catch {
      return false;
    }
  }

  private client_convertor(
    document: UserSchemaDocumentType,
  ): Client_UserInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      updateAt: document.updatedAt,
      profileInfo: {
        email: document.profileInfo.email,
        fullName: document.profileInfo.fullName,
        gender: document.profileInfo.gender,
        pic: document.profileInfo.pic,
        username: document.profileInfo.username,
        location: document.profileInfo?.location,
        phoneNumber: document.profileInfo?.phoneNumber || [],
      },
      access: {
        isAdmin: document.access.isAdmin,
        active:
          document.access?.active !== undefined
            ? document.access?.active
            : true,
        role: document.access?.role && {
          id: (
            document.access.role as RoleInterfaceDocumentType
          )._id.toString(),
          name: (document.access.role as RoleInterfaceDocumentType).name,
          color: (document.access.role as RoleInterfaceDocumentType).color,
        },
      },
    };
  }

  // when module gets initialized (set the user with isAdmin to the admin role id)
  async onModuleInit() {
    // if the admin exits (In Production)
    if (process.env.NODE_ENV === 'production') {
      if (this.roleService.defaultRolesIDs?.Admin) {
        // set the user isAdmin role to the admin id
        try {
          // find the user with isAdmin and set his id
          await this.UserModel.updateOne(
            {
              'access.isAdmin': true,
            },
            {
              // set the role
              'access.role': this.roleService.defaultRolesIDs?.Admin,
            },
          );

          // log
          this.logger.fatal('USER ADMIN ROLE SET SUCCESSFULLY');
        } catch (err) {
          this.logger.log('Set the Admin ID', err);
        }
      }
    }
  }
}
