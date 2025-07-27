import { Types } from 'mongoose';
import { UserSchemaDocumentType } from 'src/app/modules/user/interfaces/user.interface';

// the type of the crm contact

export default interface ContactInterface {
  // the personal info the contact
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    pic: string; // pic of the contact
    location: {
      country?: string;
      state?: string;
      city?: string;
      address?: string;
      zipcode?: string;
    };
  };

  // bio of the contact
  bio: string;

  // emails of hte user
  emails: string[];

  // work & industry
  work: {
    industry?: string;
    occupation?: string;
    company?: string; // of company of the user (Ref)
  };

  // phone numbers types (fax,mobile...)
  phoneNumbers: {
    mobile: string[]; // mobile phone numbers
    fax: string[]; // fax phone numbers
    whatsapp: string[]; // whatsapp phone numbers
    viber: string[]; // viber phone numbers
  };

  // social media accounts
  socialMedia: {
    facebook: string[]; // facebook accounts
    instagram: string[]; // instagram accounts
    telegram: string[]; // telegram accounts links
    youtube: string[]; // youtube accounts
    linkedin: string[]; // linkedin accounts
    twitter: string[]; // twitter/x accounts
    tiktok: string[]; // tiktok accounts
    pinterest: string[]; // pinterest accounts
    snapchat: string[]; // snapchat accounts
    reddit: string[]; // reddit accounts
    twitch: string[]; // twitch accounts
    other: string[]; // other social media accounts
  };

  // access (the access is if this contact has a user account with role and access info)
  access?: UserSchemaDocumentType | string; // (Ref to the user) (optional)

  // resource (where the contact is founded e.x 'facebook','sm' )
  resource: string;
  // insertedBy (where the contact was created (enum 'website' | 'dashboard') )
  insertedBy: 'website' | 'dashboard';
}

export interface ContactInterfaceDocumentType
  extends ContactInterface,
    Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Contact type

export interface Create_ContactInterface
  extends Omit<ContactInterface, 'access' | 'insertedBy'> {
  access?: string | null; // the user id
}

// Client Contact type (the object type that client should get)

export interface Client_ContactInterface
  extends Omit<ContactInterface, 'access'> {
  createdAt: string | Date; // IOS Date
  updateAt: string | Date; // IOS Date
  id: string;

  // the access type
  access: {
    createdAt: string | Date;
    id: string;

    // main info
    profileInfo: {
      pic: string;
      username: string;
      email: string;
      fullName: string;
      phoneNumber?: string[];
      location?: {
        country?: string;
        state?: string;
        city?: string;
        zipcode?: string;
      };
      gender: 'male' | 'female';
    };

    // access/auth info
    access: {
      role: {
        id: string;
        name: string;
        color: string;
      };
      active: boolean;
      isAdmin: boolean;
    };
  } | null;
}
