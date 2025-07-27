import { Types } from 'mongoose';

// the type of the crm industry

export default interface IndustryInterface {
  name: string;
}

export interface IndustryInterfaceDocumentType
  extends IndustryInterface,
    Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Industry type

export interface Create_IndustryInterface extends IndustryInterface {}

// Client CRM Industry type (the object type that client should get)

export interface Client_IndustryInterface extends IndustryInterface {
  createdAt: string | Date; // IOS Date
  id: string;
}
