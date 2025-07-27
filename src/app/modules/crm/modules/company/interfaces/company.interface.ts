import { Types } from 'mongoose';

// company size type (resource linkedin)
export type CompanySizeType =
  | '1'
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5001-10,000'
  | '10,001';

// the type of the crm company

export default interface CompanyInterface {
  //  main info
  info: {
    // name of the company
    name: string;
    // company size
    size: CompanySizeType;
    // company logo url
    logo: string;
    // description of the company
    description: string;
    // location
    location?: {
      country?: string;
      state?: string;
      city?: string;
      region: string;
      zipcode?: string;
      address?: string;
    };
  };

  // emails of company
  emails: string[];

  // phone numbers types (fax,mobile...)
  phoneNumbers: {
    mobile: string[]; // mobile phone numbers
    fax: string[]; // fax phone numbers
    whatsapp: string[]; // whatsapp phone numbers
    direct_line: string[]; // direct line numbers
    viber: string[]; // viber phone numbers
  };

  // the identification details of the company
  identificationDetails: {
    TIN: string; //  Tax Identification Number
    CRN: string; // Company Registration Number
    TAX_Code: string; // Tax Article
    Statistical_Code: string; // Statistical Identification Number
  };

  // social media accounts
  socialMedia: {
    website: string[]; // website of the company
    linkedin: string[]; // linkedin accounts
    facebook: string[]; // facebook accounts
    instagram: string[]; // instagram accounts
    youtube: string[]; // youtube accounts
    other: string[]; // other social media accounts
  };

  // work & department info
  category: string; // category the company
  industry: string;

  // resource (where the contact is founded e.x 'facebook','sm' )
  resource: string;
}

export interface CompanyInterfaceDocumentType
  extends CompanyInterface,
    Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Company type

export interface Create_CompanyInterface extends CompanyInterface {}

// Client Company type (the object type that client should get)
export interface Client_CompanyInterface extends CompanyInterface {
  createdAt: string | Date; // IOS Date
  updateAt: string | Date; // IOS Date
  id: string;
}
