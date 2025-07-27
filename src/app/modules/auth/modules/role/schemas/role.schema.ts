import { Schema } from 'mongoose';
import RoleInterface from '../interfaces/role.interface';

// role schema

export const RoleSchema = new Schema<RoleInterface>(
  {
    // name of the role
    name: {
      required: true,
      type: String,
    },

    // deletable
    deletable: {
      required: true,
      type: Boolean,
    },

    // permissions of the role
    permissions: [
      {
        required: false,
        type: String,
      },
    ],

    // badge color of role
    color: {
      required: true,
      type: String,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);
