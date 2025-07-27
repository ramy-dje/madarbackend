import { Types } from 'mongoose';
import { RoleInterfaceDocumentType } from '../../auth/modules/role/interfaces/role.interface';
// User Interface

export interface UserInterface {
  id: string;
  // profile info
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
  // access or auth
  access: {
    role: RoleInterfaceDocumentType | string;
    active: boolean;
    isAdmin: boolean;
    canPost: boolean;
    password: string;
    oauth: boolean;
    oauthProvider?: 'google' | null;
    verified: boolean;
  };
}

export interface UserSchemaDocumentType extends UserInterface, Document {
  createdAt: string;
  updatedAt: string;
  _id: Types.ObjectId;
}

// Client User type (the object type that client should get)
export interface Client_UserInterface {
  createdAt: string | Date; // IOS Date
  updateAt: string | Date; // IOS Date
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
}

// Client User slim type (the object type that client should get)
export interface Client_User_Slim_Interface {
  id: string;
  profileInfo: {
    pic: string;
    username: string;
    email: string;
    fullName: string;
  };
}
