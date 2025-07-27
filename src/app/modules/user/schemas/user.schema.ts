import { Schema } from 'mongoose';
import { UserInterface } from '../interfaces/user.interface';
import { boolean } from 'zod';

export const UserSchema = new Schema<UserInterface>(
  {
    profileInfo: {
      pic: {
        type: String,
        required: false,
        default: '',
      },
      username: {
        required: true,
        type: String,
        minlength: 2,
      },
      phoneNumber: [
        {
          required: true,
          type: String,
        },
      ],
      gender: {
        required: true,
        enum: ['male', 'female'],
        default: 'male',
        type: String,
      },
      // location
      location: {
        country: {
          required: false,
          type: String,
        },
        state: {
          required: false,
          type: String,
        },
        city: {
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
      fullName: {
        required: true,
        type: String,
        minlength: 2,
      },
      email: {
        required: true,
        type: String,
        unique: true,
      },
    },
    access: {
      role: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Roles',
      },
      oauth: {
        required: true,
        type: Boolean,
        default: false,
      },
      isAdmin: {
        required: false,
        type: Boolean,
        default: false,
      },
      active: {
        required: false,
        type: Boolean,
        default: true,
      },
      oauthProvider: {
        required: false,
        type: String,
        enum: ['google', ''],
        default: '',
      },
      canPost: {
        required: true,
        type: Boolean,
        default: false,
      },
      password: {
        required: false,
        type: String,
        minlength: 8,
      },
      verified: {
        required: true,
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: true, timestamps: true },
);
