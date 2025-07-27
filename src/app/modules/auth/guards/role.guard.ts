import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  mixin,
} from '@nestjs/common';
import { AuthenticatedUserRequestInterInterface } from '../interfaces/authenticated-user-request.interface';
import { AuthUserRole } from 'src/core/interfaces/auth.type';
import { AuthService } from '../services/auth.service';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

export const AuthRole = (
  role: (AuthUserRole | string)[] | (AuthUserRole | string),
  ...permissions_arrays: SystemPermissions[][]
) => {
  //  auth role mixin guard
  class authRoleMixin implements CanActivate {
    logger = new Logger('AuthRoleGuard');
    allowed_roles = [...(Array.isArray(role) ? [...role] : [role])];
    constructor(
      @Inject(AuthService)
      readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      // getting the request
      const req: AuthenticatedUserRequestInterInterface = context
        .switchToHttp()
        .getRequest();
      try {
        // check if his authenticated
        if (!req.user) {
          throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
        }
        // getting the user
        const { role, permissions: userPermissions } =
          await this.authService.checkUserAndRole(req.user.id);

        // check the role of the user
        if (
          !this.allowed_roles.includes(role.name) &&
          this.allowed_roles.length != 0
        ) {
          throw new HttpException('Access Denied2', HttpStatus.FORBIDDEN);
        }

        // check if the permissions arrays has to be checked
        if (permissions_arrays) {
          // check if the user dose't have the required permissions (at least one of the permissions arrays hav to pass the check)
          if (
            !permissions_arrays
              .map((per_array) =>
                per_array
                  .map((per) => userPermissions.includes(per))
                  .every((e) => e),
              )
              .includes(true)
          ) {
            throw new HttpException('Access Denied3', HttpStatus.FORBIDDEN);
          }
        }

        // setting the permissions and the role (access info) in the req's user ojb
        if (role && userPermissions && req?.user) {
          // user obj with role and permissions (access info)
          const user: typeof req.user = {
            ...req.user,
            access: {
              role: {
                color: role.color,
                id: role.id,
                name: role.name,
              },
              permissions: userPermissions,
            },
          };
          // setting the user to the req.user
          req.user = user;
        }

        // if the role is OK returning true
        return true;
      } catch (err) {
        if (err instanceof HttpException) {
          throw err;
        }
        return false;
      }
    }
  }

  // create the guard with mixin
  const guard = mixin(authRoleMixin);
  // returning the guard
  return guard;
};
