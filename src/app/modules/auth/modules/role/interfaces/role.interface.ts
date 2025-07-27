import { Types } from 'mongoose';
import { RolePermissionType } from './permission.interfaces';

// the type of the role

export default interface RoleInterface {
  // the role name
  name: string;
  // deletable (of the role can not be deleted like the 'Admin' | 'User' | 'Manager' of the default roles)
  deletable: boolean;
  // permissions (the role permissions)
  permissions: RolePermissionType[];
  // role badge color
  color: string;
}

export interface RoleInterfaceDocumentType extends RoleInterface, Document {
  _id: Types.ObjectId;
  createdAt: string; // IOS Date
  updatedAt: string; // IOS Date
}

// Create Role type
export interface Create_RoleInterface
  extends Omit<RoleInterface, 'deletable'> {}

// Client Role type (the object type that client should get)

export interface Client_RoleInterface extends RoleInterface {
  createdAt: string | Date; // IOS Date
  id: string;
}
