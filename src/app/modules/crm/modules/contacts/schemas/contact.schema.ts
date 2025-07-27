import { Schema } from 'mongoose';
import ContactInterface from '../interfaces/contacts.interface';

// the db schema of the crm contact
export const ContactSchema = new Schema<ContactInterface>(
  {
    // personal info of the contact
    personalInfo: {
      // first name of the contact
      firstName: {
        required: true,
        type: String,
        minlength: 1,
      },
      // last name of the contact
      lastName: {
        required: true,
        type: String,
        minlength: 1,
      },
      // gender of the contact
      gender: {
        required: true,
        enum: ['male', 'female'],
        default: 'male',
        type: String,
      },
      // picture of the contact
      pic: {
        type: String,
        required: false,
        default: '',
      },
      // location of the contact
      location: {
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
    // bio of the contact
    bio: {
      required: false,
      default: '',
      type: String,
    },

    // emails of the contact
    emails: [
      {
        required: true,
        lowercase: true,
        type: String,
      },
    ],

    // work & industry info
    work: {
      // company of the contact (*TODO - Make the company as ref to the company model)
      company: {
        required: false,
        type: String,
      },
      // industry of the contact
      industry: {
        required: false,
        type: String,
      },
      // occupation of the contact
      occupation: {
        required: false,
        type: String,
      },
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

    // social media accounts
    socialMedia: {
      // facebook phone numbers
      facebook: [
        {
          required: true,
          type: String,
        },
      ],
      // instagram phone numbers
      instagram: [
        {
          required: true,
          type: String,
        },
      ],
      // telegram phone numbers
      telegram: [
        {
          required: true,
          type: String,
        },
      ],
      // youtube phone numbers
      youtube: [
        {
          required: true,
          type: String,
        },
      ],
      // linkedin phone numbers
      linkedin: [
        {
          required: true,
          type: String,
        },
      ],
      // twitter phone numbers
      twitter: [
        {
          required: true,
          type: String,
        },
      ],
      // tiktok phone numbers
      tiktok: [
        {
          required: true,
          type: String,
        },
      ],
      // pinterest phone numbers
      pinterest: [
        {
          required: true,
          type: String,
        },
      ],
      // snapchat phone numbers
      snapchat: [
        {
          required: true,
          type: String,
        },
      ],
      // reddit phone numbers
      reddit: [
        {
          required: true,
          type: String,
        },
      ],
      // twitch phone numbers
      twitch: [
        {
          required: true,
          type: String,
        },
      ],
      // other phone numbers
      other: [
        {
          required: true,
          type: String,
        },
      ],
    },

    // access (user account)
    access: {
      required: false,
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },

    // contact resource
    resource: {
      required: false,
      default: '',
      type: String,
    },
    // contact insertedBy
    insertedBy: {
      required: false,
      type: String,
      enum: ['website', 'dashboard'],
      default: 'dashboard',
    },
  },
  { _id: true, timestamps: true },
);
