import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ContactInterface, {
  Client_ContactInterface,
  ContactInterfaceDocumentType,
  Create_ContactInterface,
} from '../interfaces/contacts.interface';
import { CoreService } from 'src/core/services/core.service';
import { UserSchemaDocumentType } from 'src/app/modules/user/interfaces/user.interface';
import { RoleInterfaceDocumentType } from 'src/app/modules/auth/modules/role/interfaces/role.interface';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import ContactFilteringInterface from '../interfaces/contacts.filtering';
import { IndustryService } from '../../industry/services/industry.service';
import { OccupationService } from '../../occupation/services/occupation.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel('CRM_Contacts')
    private readonly contactModel: Model<ContactInterface>,
    @Inject(IndustryService) private readonly industryService: IndustryService,
    @Inject(OccupationService)
    private readonly occupationService: OccupationService,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all contacts with pagination
  async get_all_contacts(
    pagination: PaginationQueryInterface,
    filters: ContactFilteringInterface,
  ): Promise<PaginatedResponse<Client_ContactInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the contacts
      const res = await this.contactModel.find(
        {
          // filters (first/last name , bio filtering)
          ...(filters.name
            ? {
                $or: [
                  {
                    'personalInfo.firstName': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'personalInfo.lastName': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    bio: {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    $expr: {
                      $regexMatch: {
                        input: {
                          $concat: [
                            '$personalInfo.firstName',
                            ' ',
                            '$personalInfo.lastName',
                          ],
                        },
                        regex: filters.name,
                        options: 'i',
                      },
                    },
                  },
                ],
              }
            : {}),

          // filters (gender filtering)
          ...(filters.gender
            ? {
                'personalInfo.gender': filters.gender,
              }
            : {}),

          // filters (gender filtering)
          ...(filters.email
            ? {
                emails: filters.email,
              }
            : {}),

          // filters (company filtering)
          ...(filters.work_company
            ? {
                'work.company': {
                  $regex: RegExp(
                    `${filters.work_company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),

          // filters (industry filtering)
          ...(filters.work_industry
            ? {
                'work.industry': {
                  $regex: RegExp(
                    `${filters.work_industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),

          // filters (occupation filtering)
          ...(filters.work_occupation
            ? {
                'work.occupation': {
                  $regex: RegExp(
                    `${filters.work_occupation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),

          // filters (phone number filtering)
          ...(filters.phoneNumber
            ? {
                $or: [
                  {
                    'phoneNumbers.mobile': {
                      $regex: RegExp(
                        `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'phoneNumbers.fax': {
                      $regex: RegExp(
                        `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'phoneNumbers.whatsapp': {
                      $regex: RegExp(
                        `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'phoneNumbers.viber': {
                      $regex: RegExp(
                        `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                ],
              }
            : {}),

          // filtering (country)
          ...(filters.location_country
            ? {
                'personalInfo.location.country': {
                  $regex: RegExp(
                    `${filters.location_country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),

          // filtering (global location)
          ...(filters.location_global
            ? {
                $or: [
                  {
                    'personalInfo.location.state': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'personalInfo.location.city': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'personalInfo.location.zipcode': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'personalInfo.location.address': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                ],
              }
            : {}),
        },
        {},
        {
          populate: {
            // populate the access (user) the role inside it
            path: 'access',
            populate: {
              path: 'access.role',
            },
          },
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
      const total = await this.contactModel.countDocuments({
        // filters (first/last name , bio filtering)
        ...(filters.name
          ? {
              $or: [
                {
                  'personalInfo.firstName': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'personalInfo.lastName': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  bio: {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  $expr: {
                    $regexMatch: {
                      input: {
                        $concat: [
                          '$personalInfo.firstName',
                          ' ',
                          '$personalInfo.lastName',
                        ],
                      },
                      regex: filters.name,
                      options: 'i',
                    },
                  },
                },
              ],
            }
          : {}),

        // filters (gender filtering)
        ...(filters.gender
          ? {
              'personalInfo.gender': filters.gender,
            }
          : {}),

        // filters (gender filtering)
        ...(filters.email
          ? {
              emails: filters.email,
            }
          : {}),

        // filters (company filtering)
        ...(filters.work_company
          ? {
              'work.company': {
                $regex: RegExp(
                  `${filters.work_company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),

        // filters (industry filtering)
        ...(filters.work_industry
          ? {
              'work.industry': {
                $regex: RegExp(
                  `${filters.work_industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),

        // filters (occupation filtering)
        ...(filters.work_occupation
          ? {
              'work.occupation': {
                $regex: RegExp(
                  `${filters.work_occupation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),

        // filters (phone number filtering)
        ...(filters.phoneNumber
          ? {
              $or: [
                {
                  'phoneNumbers.mobile': {
                    $regex: RegExp(
                      `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'phoneNumbers.fax': {
                    $regex: RegExp(
                      `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'phoneNumbers.whatsapp': {
                    $regex: RegExp(
                      `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'phoneNumbers.viber': {
                    $regex: RegExp(
                      `${filters.phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
              ],
            }
          : {}),

        // filtering (country)
        ...(filters.location_country
          ? {
              'personalInfo.location.country': {
                $regex: RegExp(
                  `${filters.location_country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),

        // filtering (global location)
        ...(filters.location_global
          ? {
              $or: [
                {
                  'personalInfo.location.state': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'personalInfo.location.city': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'personalInfo.location.zipcode': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'personalInfo.location.address': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
              ],
            }
          : {}),
      });

      // returning the types
      const data = res.map((type) => this.client_convertor(type as any));
      return this.paginationService.createPaginatedResponse(data, total, page, size);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get one type
  async get_contact_by_id(
    contact_id: string,
  ): Promise<Client_ContactInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(contact_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }
      // getting the contact
      const res = await this.contactModel.findById(
        contact_id,
        {},
        {
          populate: {
            // populate the access (user) the role inside it
            path: 'access',
            populate: {
              path: 'access.role',
            },
          },
          lean: true, // to return lightweight document
        },
      );

      //  check if it doesn't exist
      if (!res?._id) {
        throw new HttpException(
          'Contact With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the contact
      return this.client_convertor(res as any);
    } catch (err) {
      console.log('ERROR : ', err);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create a contact
  async create_contact(contact: Create_ContactInterface): Promise<string> {
    try {
      // check if the contact has a access/user and id of it is valid
      // checking the user id
      if (
        contact?.access &&
        !this.coreService.isValid_ObjectId(contact?.access)
      ) {
        throw new HttpException(
          'Access ID Is Not Valid',
          HttpStatus.BAD_REQUEST,
        );
      }

      // check if the contact has a company and id of it is valid (*NOTE -  Company Relationship Not Implemented Yet)
      // // checking the company id
      // if (
      //   contact?.work.company &&
      //   !this.coreService.isValid_ObjectId(contact?.work.company)
      // ) {
      //   throw new HttpException(
      //     'Company ID Is Not Valid',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // add the industry that was used in this contact
      if (contact.work?.industry && contact.work?.industry.trim()) {
        await this.industryService.addIndustry(contact.work?.industry.trim());
      }

      // add the occupation that was used in this contact
      if (contact.work?.occupation && contact.work?.occupation.trim()) {
        await this.occupationService.addOccupation(
          contact.work?.occupation.trim(),
        );
      }

      // create the contact

      const new_contact = new this.contactModel({
        personalInfo: {
          firstName: contact.personalInfo.firstName,
          lastName: contact.personalInfo.lastName,
          pic: contact.personalInfo.pic,
          location: contact.personalInfo.location,
          gender: contact.personalInfo.gender,
        },
        emails: contact.emails,
        bio: contact.bio,
        phoneNumbers: {
          fax: contact.phoneNumbers.fax,
          mobile: contact.phoneNumbers.mobile,
          viber: contact.phoneNumbers.viber,
          whatsapp: contact.phoneNumbers.whatsapp,
        },
        socialMedia: {
          facebook: contact.socialMedia.facebook,
          instagram: contact.socialMedia.instagram,
          linkedin: contact.socialMedia.linkedin,
          other: contact.socialMedia.other,
          pinterest: contact.socialMedia.pinterest,
          reddit: contact.socialMedia.reddit,
          snapchat: contact.socialMedia.snapchat,
          telegram: contact.socialMedia.telegram,
          tiktok: contact.socialMedia.tiktok,
          twitch: contact.socialMedia.twitch,
          twitter: contact.socialMedia.twitter,
          youtube: contact.socialMedia.youtube,
        },
        work: {
          occupation: contact.work.occupation,
          industry: contact.work.industry,
          company: contact.work.company,
        },
        access: contact.access,
        resource: contact.resource,
        insertedBy: 'dashboard', // by the dashboard (through the endpoint)
      });

      // saving the document in the db
      await new_contact.save();

      // returning the a message
      return 'Contact Was Created Successfully';
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update a contact
  async update_contact(
    contact_id: string,
    contact: Partial<Create_ContactInterface>,
  ): Promise<string> {
    try {
      // check the id of the contact
      if (!this.coreService.isValid_ObjectId(contact_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const existed_contact = await this.contactModel.findById(
        contact_id,
        {},
        {
          lean: true, // lightweight document
        },
      );

      // if it dons't exist
      if (!existed_contact?._id) {
        throw new HttpException(
          'Contact With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // check if the access/user was and id is valid
      if (
        contact?.access &&
        existed_contact?.access &&
        contact.access != existed_contact?.access.toString() &&
        !this.coreService.isValid_ObjectId(contact?.access)
      ) {
        throw new HttpException(
          'Access ID Is Not Valid',
          HttpStatus.BAD_REQUEST,
        );
      }

      // check if the company was and id is valid (*NOTE -  Company Relationship Not Implemented Yet)
      // if (
      //   contact?.work?.company &&
      //   existed_contact?.work?.company &&
      //   contact.work.company != existed_contact.work.company.toString() &&
      //   !this.coreService.isValid_ObjectId(contact.work.company)
      // ) {
      //   throw new HttpException(
      //     'Company ID Is Not Valid',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // check if the industry has changed to add it
      if (contact.work?.industry && contact.work?.industry.trim()) {
        await this.industryService.addIndustry(contact.work?.industry.trim());
      }

      // check if the occupation has changed to add it
      if (contact.work?.occupation && contact.work?.occupation.trim()) {
        await this.occupationService.addOccupation(
          contact.work?.occupation.trim(),
        );
      }

      // update the contact

      await this.contactModel.updateOne(
        { _id: contact_id },
        {
          'personalInfo.firstName': contact?.personalInfo?.firstName,
          'personalInfo.lastName': contact?.personalInfo?.lastName,
          'personalInfo.pic': contact?.personalInfo?.pic,
          'personalInfo.location': contact?.personalInfo?.location,
          'personalInfo.gender': contact?.personalInfo?.gender,
          emails: contact?.emails,

          bio: contact?.bio,

          'phoneNumbers.fax': contact?.phoneNumbers?.fax,
          'phoneNumbers.mobile': contact?.phoneNumbers?.mobile,
          'phoneNumbers.viber': contact?.phoneNumbers?.viber,
          'phoneNumbers.whatsapp': contact?.phoneNumbers?.whatsapp,

          'socialMedia.facebook': contact?.socialMedia?.facebook,
          'socialMedia.instagram': contact?.socialMedia?.instagram,
          'socialMedia.linkedin': contact?.socialMedia?.linkedin,
          'socialMedia.other': contact?.socialMedia?.other,
          'socialMedia.pinterest': contact?.socialMedia?.pinterest,
          'socialMedia.reddit': contact?.socialMedia?.reddit,
          'socialMedia.snapchat': contact?.socialMedia?.snapchat,
          'socialMedia.telegram': contact?.socialMedia?.telegram,
          'socialMedia.tiktok': contact?.socialMedia?.tiktok,
          'socialMedia.twitch': contact?.socialMedia?.twitch,
          'socialMedia.twitter': contact?.socialMedia?.twitter,
          'socialMedia.youtube': contact?.socialMedia?.youtube,

          'work.occupation': contact?.work?.occupation,
          'work.industry': contact?.work?.industry,
          'work.company': contact?.work?.company,

          access: contact?.access,

          resource: contact?.resource,
        },
      );

      // returning the a message
      return 'Contact Was Update Successfully';
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a contact
  async delete_contact(contact_id: string): Promise<string> {
    // checking the id
    if (!this.coreService.isValid_ObjectId(contact_id)) {
      throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
    }

    // checking the contact
    const existed = await this.contactModel.exists({
      _id: contact_id,
    });

    if (!existed?._id) {
      throw new HttpException(
        'Contact With This ID Does Not Exist',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // deleting the contact
      await this.contactModel.deleteOne({ _id: contact_id });

      // returning a message
      return 'Contact Was Deleted Successfully';
    } catch {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete many contacts
  async delete_many_contacts(contacts_ids: string[]) {
    try {
      // checking the ids
      if (!contacts_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // delete the contacts
      await this.contactModel.deleteMany({
        _id: {
          $in: contacts_ids, // delete each doc with id included in the array
        },
      });

      return 'Contacts Where Deleted Successfully';
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

  // the client convertor
  private client_convertor(
    document: ContactInterfaceDocumentType,
  ): Client_ContactInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      createdAt: document.createdAt,
      updateAt: document.updatedAt,
      personalInfo: document.personalInfo,
      bio: document.bio,
      emails: document.emails,
      phoneNumbers: document.phoneNumbers,
      work: {
        occupation: document.work?.occupation || null,
        industry: document.work?.industry || null,
        company: document.work?.company || null,
      },
      socialMedia: document.socialMedia,
      // resource
      resource: document.resource || '',
      // insertedBy
      insertedBy: document.insertedBy || 'dashboard',
      // access data
      access: document.access
        ? {
            id: (document.access as UserSchemaDocumentType)._id.toString(),
            createdAt: (document.access as UserSchemaDocumentType).createdAt,
            profileInfo: {
              email: (document.access as UserSchemaDocumentType).profileInfo
                .email,
              fullName: (document.access as UserSchemaDocumentType).profileInfo
                .fullName,
              gender: (document.access as UserSchemaDocumentType).profileInfo
                .gender,
              pic: (document.access as UserSchemaDocumentType).profileInfo.pic,
              username: (document.access as UserSchemaDocumentType).profileInfo
                .username,
              location: (document.access as UserSchemaDocumentType).profileInfo
                ?.location,
              phoneNumber:
                (document.access as UserSchemaDocumentType).profileInfo
                  ?.phoneNumber || [],
            },
            access: {
              isAdmin: (document.access as UserSchemaDocumentType).access
                .isAdmin,
              active:
                (document.access as UserSchemaDocumentType).access?.active !==
                undefined
                  ? (document.access as UserSchemaDocumentType).access?.active
                  : true,
              role: (document.access as UserSchemaDocumentType).access
                ?.role && {
                id: (
                  (document.access as UserSchemaDocumentType).access
                    .role as RoleInterfaceDocumentType
                )._id.toString(),
                name: (
                  (document.access as UserSchemaDocumentType).access
                    .role as RoleInterfaceDocumentType
                ).name,
                color: (
                  (document.access as UserSchemaDocumentType).access
                    .role as RoleInterfaceDocumentType
                ).color,
              },
            },
          }
        : null,
    };
  }
}
