import { Request } from 'express';
import { JwtBodyInterface } from '../../jwt/interfaces/jwt-body.interface';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

export interface AuthenticatedUserInterInterface extends JwtBodyInterface {
  access?: {
    role: {
      name: string;
      id: string;
      color: string;
    };
    permissions?: SystemPermissions[];
  };
}

export interface AuthenticatedUserRequestInterInterface extends Request {
  user?: AuthenticatedUserInterInterface;
}
