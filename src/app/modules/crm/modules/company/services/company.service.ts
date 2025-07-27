import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreService } from 'src/core/services/core.service';
import { CategoryService } from '../../category/services/category.service';
import { Model } from 'mongoose';
import CompanyInterface, {
  Client_CompanyInterface,
  CompanyInterfaceDocumentType,
  Create_CompanyInterface,
} from '../interfaces/company.interface';
import { IndustryService } from '../../industry/services/industry.service';
import { PaginationQueryInterface, PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { PaginationService } from 'src/core/services/pagination.service';
import CompanyFilteringInterface from '../interfaces/company.filtering';
import { StorageService } from 'src/app/modules/storage/services/storage.service';
import SimpleCRUDResponseType from 'src/core/interfaces/simple-response.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('CRM_Companies')
    private readonly companyModel: Model<CompanyInterface>,
    @Inject(IndustryService) private readonly industryService: IndustryService,
    @Inject(CategoryService) private readonly categoryService: CategoryService,
    @Inject(StorageService) private readonly storageService: StorageService,
    @Inject(CoreService) private readonly coreService: CoreService,
    @Inject(PaginationService) private readonly paginationService: PaginationService,
  ) {}

  // get all companies with pagination
  async get_all_companies(
    pagination: PaginationQueryInterface,
    filters: CompanyFilteringInterface,
  ): Promise<PaginatedResponse<Client_CompanyInterface>> {
    const { page, size, skip } = this.paginationService.getPaginationParams(pagination);

    try {
      // getting the companies
      const res = await this.companyModel.find(
        {
          // filters (name, description filtering)
          ...(filters.name
            ? {
                $or: [
                  {
                    'info.name': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'info.description': {
                      $regex: RegExp(
                        `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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
                'info.location.country': {
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
                    'info.location.state': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'info.location.city': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'info.location.region': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'info.location.zipcode': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'info.location.address': {
                      $regex: RegExp(
                        `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                ],
              }
            : {}),

          // size (filtering)
          ...(filters.company_size
            ? {
                'info.size': filters.company_size,
              }
            : {}),

          // filters (email filtering)
          ...(filters.email
            ? {
                emails: filters.email,
              }
            : {}),

          // filters (category filtering)
          ...(filters.category
            ? {
                category: {
                  $regex: RegExp(
                    `${filters.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                    'i',
                  ),
                },
              }
            : {}),

          // filters (industry filtering)
          ...(filters.industry
            ? {
                industry: {
                  $regex: RegExp(
                    `${filters.industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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
                    'phoneNumbers.direct_line': {
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

          // filtering (identification)
          ...(filters.identification
            ? {
                $or: [
                  {
                    'identificationDetails.TIN': {
                      $regex: RegExp(
                        `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'identificationDetails.CRN': {
                      $regex: RegExp(
                        `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'identificationDetails.TAX_Code': {
                      $regex: RegExp(
                        `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                        'i',
                      ),
                    },
                  },
                  {
                    'identificationDetails.Statistical_Code': {
                      $regex: RegExp(
                        `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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
      const total = await this.companyModel.countDocuments({
        // filters (name, description filtering)
        ...(filters.name
          ? {
              $or: [
                {
                  'info.name': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'info.description': {
                    $regex: RegExp(
                      `${filters.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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
              'info.location.country': {
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
                  'info.location.state': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'info.location.city': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'info.location.region': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'info.location.zipcode': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'info.location.address': {
                    $regex: RegExp(
                      `${filters.location_global.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
              ],
            }
          : {}),

        // size (filtering)
        ...(filters.company_size
          ? {
              'info.size': filters.company_size,
            }
          : {}),

        // filters (email filtering)
        ...(filters.email
          ? {
              emails: filters.email,
            }
          : {}),

        // filters (category filtering)
        ...(filters.category
          ? {
              category: {
                $regex: RegExp(
                  `${filters.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                  'i',
                ),
              },
            }
          : {}),

        // filters (industry filtering)
        ...(filters.industry
          ? {
              industry: {
                $regex: RegExp(
                  `${filters.industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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
                  'phoneNumbers.direct_line': {
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

        // filtering (identification)
        ...(filters.identification
          ? {
              $or: [
                {
                  'identificationDetails.TIN': {
                    $regex: RegExp(
                      `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'identificationDetails.CRN': {
                    $regex: RegExp(
                      `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'identificationDetails.TAX_Code': {
                    $regex: RegExp(
                      `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                      'i',
                    ),
                  },
                },
                {
                  'identificationDetails.Statistical_Code': {
                    $regex: RegExp(
                      `${filters.identification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
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

  // Get one company
  async get_company_by_id(
    company_id: string,
  ): Promise<Client_CompanyInterface> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(company_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }
      // getting the company
      const res = await this.companyModel.findById(
        company_id,
        {},
        {
          lean: true, // to return lightweight document
        },
      );

      //  check if it doesn't exist
      if (!res?._id) {
        throw new HttpException(
          'Company With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // returning the company
      return this.client_convertor(res as any);
    } catch (err) {
      console.log('ERROR : ', err);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create a company
  async create_company(
    company: Create_CompanyInterface,
  ): Promise<SimpleCRUDResponseType> {
    try {
      // add the industry that was used in this company
      if (company.industry && company.industry.trim()) {
        await this.industryService.addIndustry(company.industry.trim());
      }

      // add the category that was used in this company
      if (company.category && company.category.trim()) {
        await this.categoryService.addCategory(company.category.trim());
      }

      // create the company
      const new_company = new this.companyModel({
        info: {
          name: company.info.name,
          logo: company.info.logo,
          size: company.info.size,
          location: company.info.location,
          description: company.info.description,
        },
        emails: company.emails,
        phoneNumbers: {
          fax: company.phoneNumbers.fax,
          mobile: company.phoneNumbers.mobile,
          viber: company.phoneNumbers.viber,
          direct_line: company.phoneNumbers.direct_line,
          whatsapp: company.phoneNumbers.whatsapp,
        },
        socialMedia: {
          facebook: company.socialMedia.facebook,
          instagram: company.socialMedia.instagram,
          linkedin: company.socialMedia.linkedin,
          other: company.socialMedia.other,
          website: company.socialMedia.website,
          youtube: company.socialMedia.youtube,
        },
        industry: company.industry,
        category: company.category,
        resource: company.resource,
        identificationDetails: {
          CRN: company.identificationDetails.CRN,
          Statistical_Code: company.identificationDetails.Statistical_Code,
          TAX_Code: company.identificationDetails.TAX_Code,
          TIN: company.identificationDetails.TIN,
        },
      });

      // saving the document in the db
      await new_company.save();

      // returning the a message
      return {
        message: 'Company Was Created Successfully',
        id: new_company._id.toString(),
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update a company
  async update_company(
    company_id: string,
    company: Partial<Create_CompanyInterface>,
  ): Promise<SimpleCRUDResponseType> {
    try {
      // check the id of the company
      if (!this.coreService.isValid_ObjectId(company_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // check if it exists
      const existed_company = await this.companyModel.findById(
        company_id,
        {},
        {
          lean: true, // lightweight document
        },
      );

      // if it dons't exist
      if (!existed_company?._id) {
        throw new HttpException(
          'Company With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // add the industry that was used in this company
      if (company.industry && company.industry.trim()) {
        await this.industryService.addIndustry(company.industry.trim());
      }

      // add the category that was used in this company
      if (company.category && company.category.trim()) {
        await this.categoryService.addCategory(company.category.trim());
      }

      // update the company

      await this.companyModel.updateOne(
        { _id: company_id },
        {
          'info.name': company?.info?.name,
          'info.size': company?.info?.size,
          'info.logo': company?.info?.logo,
          'info.description': company?.info?.description,
          'info.location': company?.info?.location,

          emails: company?.emails,

          'phoneNumbers.fax': company?.phoneNumbers?.fax,
          'phoneNumbers.mobile': company?.phoneNumbers?.mobile,
          'phoneNumbers.viber': company?.phoneNumbers?.viber,
          'phoneNumbers.direct_line': company?.phoneNumbers?.direct_line,
          'phoneNumbers.whatsapp': company?.phoneNumbers?.whatsapp,

          'socialMedia.facebook': company?.socialMedia?.facebook,
          'socialMedia.instagram': company?.socialMedia?.instagram,
          'socialMedia.linkedin': company?.socialMedia?.linkedin,
          'socialMedia.other': company?.socialMedia?.other,
          'socialMedia.website': company?.socialMedia?.website,
          'socialMedia.youtube': company?.socialMedia?.youtube,

          industry: company?.industry,
          category: company?.category,

          resource: company.resource,

          'identificationDetails.TIN': company?.identificationDetails?.TIN,
          'identificationDetails.CRN': company?.identificationDetails?.CRN,
          'identificationDetails.TAX_Code':
            company?.identificationDetails?.TAX_Code,
          'identificationDetails.Statistical_Code':
            company?.identificationDetails?.Statistical_Code,
        },
      );

      // returning the a message
      return { message: 'Contact Was Update Successfully', id: company_id };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a company
  async delete_company(company_id: string): Promise<SimpleCRUDResponseType> {
    try {
      // checking the id
      if (!this.coreService.isValid_ObjectId(company_id)) {
        throw new HttpException('ID Is Not Valid', HttpStatus.BAD_REQUEST);
      }

      // checking the company
      const company = await this.companyModel.findOne(
        {
          _id: company_id,
        },
        {
          'info.logo': true, // get the image to be deleted
        },
        {
          lean: true, // to get a lightweight document
        },
      );

      if (!company?._id) {
        throw new HttpException(
          'Company With This ID Does Not Exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // deleting the company
      await this.companyModel.deleteOne({ _id: company_id });

      // delete the image of the company
      await this.storageService.deleteObjectByPublicURL(company?.info?.logo);

      // returning a message
      return { message: 'Company Was Deleted Successfully', id: company_id };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // delete many companies
  async delete_many_companies(
    contacts_ids: string[],
  ): Promise<SimpleCRUDResponseType> {
    try {
      // checking the ids
      if (!contacts_ids.every((e) => this.coreService.isValid_ObjectId(e))) {
        throw new HttpException('IDs should be Valid', HttpStatus.BAD_REQUEST);
      }

      // get the companies images to delete them
      const companies = await this.companyModel.find(
        {
          _id: {
            $in: contacts_ids,
          },
        },
        {
          'info.logo': true, // get the image to be deleted
        },
        {
          lean: true, // to get a lightweight document
        },
      );

      // delete the contacts
      await this.companyModel.deleteMany({
        _id: {
          $in: contacts_ids, // delete each doc with id included in the array
        },
      });

      // delete the images
      await this.storageService.deleteManyObjectsByPublicURLs([
        ...companies.map((e) => e.info.logo),
      ]);

      return {
        message: 'Companies Where Deleted Successfully',
        ids: contacts_ids,
      };
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

  // the client convertor
  private client_convertor(
    document: CompanyInterfaceDocumentType,
  ): Client_CompanyInterface {
    // returning the client version
    return {
      id: document._id.toString(),
      info: document.info,
      createdAt: document.createdAt,
      updateAt: document.updatedAt,
      category: document.category,
      identificationDetails: document.identificationDetails,
      industry: document.industry,
      emails: document.emails,
      phoneNumbers: document.phoneNumbers,
      socialMedia: document.socialMedia,
      resource: document.resource || '',
    };
  }
}
