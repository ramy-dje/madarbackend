import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

// The User Access Info Type

export interface UserAccessInfoInterface {
  role: {
    name: string;
    id: string;
    color: string;
  };
  active?: boolean;
  permissions?: SystemPermissions[];
}
