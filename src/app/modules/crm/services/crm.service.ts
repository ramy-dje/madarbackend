import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoreService } from 'src/core/services/core.service';
import ContactInterface, {
  Create_ContactInterface,
} from '../modules/contacts/interfaces/contacts.interface';

@Injectable()
export class CRMService {
  constructor(
    @InjectModel('CRM_Contacts')
    private readonly contactModel: Model<ContactInterface>,
    @Inject(CoreService) private readonly coreService: CoreService,
  ) {}

  // CRM Service includes all the CRM quick functions (e.x addContact)

  // add contact (add quick contact , from other service )
  async add_contact(contact: Create_ContactInterface): Promise<{ id: string }> {
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

      // check if the contact has a company and id of it is valid
      // checking the company id
      if (
        contact?.work.company &&
        !this.coreService.isValid_ObjectId(contact?.work.company)
      ) {
        throw new HttpException(
          'Company ID Is Not Valid',
          HttpStatus.BAD_REQUEST,
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
        insertedBy: 'website', // by the dashboard (through the endpoint)
      });

      // saving the document in the db
      const res = await new_contact.save();

      // returning the a message
      return { id: res._id.toString() };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
