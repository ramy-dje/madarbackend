import { Types } from 'mongoose';

// the type of the crm occupation

export default interface OccupationInterface {
  name: string;
}

export interface OccupationInterfaceDocumentType
  extends OccupationInterface,
    Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Occupation type

export interface Create_OccupationInterface extends OccupationInterface {}

// Client CRM Occupation type (the object type that client should get)

export interface Client_OccupationInterface extends OccupationInterface {
  createdAt: string | Date; // IOS Date
  id: string;
}
