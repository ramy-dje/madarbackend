import { Types } from 'mongoose';

// the type of the crm company category

export default interface CategoryInterface {
  name: string;
}

export interface CategoryInterfaceDocumentType
  extends CategoryInterface,
    Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Category type

export interface Create_CategoryInterface extends CategoryInterface {}

// Client CRM Category type (the object type that client should get)

export interface Client_CategoryInterface extends CategoryInterface {
  createdAt: string | Date; // IOS Date
  id: string;
}
