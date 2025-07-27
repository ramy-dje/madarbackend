import { Schema } from 'mongoose';
import CompanyInterface from '../interfaces/company.interface';

// the db schema of the crm company
export const CompanySchema = new Schema<CompanyInterface>(
  {
    //  main info
    info: {
      // name of the company
      name: {
        required: false,
        default: '',
        type: String,
      },
      // size of the company
      size: {
        required: false,
        default: '1-10',
        enum: [
          '1',
          '1-10',
          '11-50',
          '51-200',
          '201-500',
          '501-1000',
          '1001-5000',
          '5001-10,000',
          '10,001',
        ],
        type: String,
      },
      // logo
      logo: {
        required: false,
        default: '',
        type: String,
      },

      // description of the company
      description: {
        required: false,
        default: '',
        type: String,
      },

      // location of the compony
      location: {
        region: {
          required: false,
          default: '',
          type: String,
        },
        country: {
          required: false,
          default: '',
          type: String,
        },
        state: {
          required: false,
          default: '',
          type: String,
        },
        city: {
          required: false,
          default: '',
          type: String,
        },
        address: {
          required: false,
          default: '',
          type: String,
        },
        zipcode: {
          required: false,
          default: '',
          type: String,
        },
      },
    },

    // emails of the contact
    emails: [
      {
        required: true,
        type: String,
      },
    ],

    // work & department info

    // industry of the company
    industry: {
      required: false,
      type: String,
    },
    // category of the company
    category: {
      required: false,
      type: String,
    },

    // phoneNumbers
    phoneNumbers: {
      // mobile phone numbers
      mobile: [
        {
          required: true,
          type: String,
        },
      ],
      // fax phone numbers
      direct_line: [
        {
          required: true,
          type: String,
        },
      ],
      // fax phone numbers
      fax: [
        {
          required: true,
          type: String,
        },
      ],
      // whatsapp phone numbers
      whatsapp: [
        {
          required: true,
          type: String,
        },
      ],
      // viber phone numbers
      viber: [
        {
          required: true,
          type: String,
        },
      ],
    },

    // identification details of the company
    identificationDetails: {
      TIN: {
        required: false,
        default: '',
        type: String,
      },
      CRN: {
        required: false,
        default: '',
        type: String,
      },
      TAX_Code: {
        required: false,
        default: '',
        type: String,
      },
      Statistical_Code: {
        required: false,
        default: '',
        type: String,
      },
    },

    // social media accounts
    socialMedia: {
      // facebook accounts
      facebook: [
        {
          required: true,
          type: String,
        },
      ],
      // instagram accounts
      instagram: [
        {
          required: true,
          type: String,
        },
      ],
      // youtube accounts
      youtube: [
        {
          required: true,
          type: String,
        },
      ],
      // linkedin accounts
      linkedin: [
        {
          required: true,
          type: String,
        },
      ],
      // website accounts
      website: [
        {
          required: true,
          type: String,
        },
      ],
      // other accounts
      other: [
        {
          required: true,
          type: String,
        },
      ],
    },

    // contact resource
    resource: {
      required: false,
      default: '',
      type: String,
    },
  },
  { _id: true, timestamps: true },
);
