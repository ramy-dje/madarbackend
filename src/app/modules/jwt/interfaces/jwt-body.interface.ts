import { AuthUserRole } from 'src/core/interfaces/auth.type';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

export interface JwtBodyInterface {
  id: string;
  role: string | AuthUserRole;
  pic: string;
  phoneNumber: string[];
  location: {
    country: string;
    state: string;
    city: string;
    zipcode: string;
  };
  gender: 'male' | 'female';
  username: string;
  fullName: string;
  email: string;
}

export type FileManagerPermissions = Extract<
  SystemPermissions,
  `file_manager:${string}`
>;

export interface JwtBodyFileManagerInterface {
  id: string;
  role: string | AuthUserRole;
  access?: {
    role: {
      name: string;
      id: string;
      color: string;
    };
    permissions?: FileManagerPermissions[];
  };
}
