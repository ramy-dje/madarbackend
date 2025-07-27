import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUserRequestInterInterface } from '../interfaces/authenticated-user-request.interface';

// This auth guard is for the requests that are coming from other servers
// Is uses the IP of the server and the Token ot

@Injectable()
export class ServerAuthGuard implements CanActivate {
  logger = new Logger('ServerAuthGuard');
  // is this server allowed (checks if this server is allowed to access)
  private IsServerAllowed(IP: string | null, bearer_token: string | null) {
    // if the IP of the token is not valid
    if (!IP || !bearer_token) return false;
    // checking logic
    const allowed_IP_addresses = [
      process.env.ALLOWED_SERVER_1_IP,
      process.env.ALLOWED_SERVER_2_IP,
    ];
    const allowed_tokens = [
      process.env.ALLOWED_SERVER_1_TOKEN,
      process.env.ALLOWED_SERVER_2_TOKEN,
    ];

    this.logger.debug(
      IP == allowed_IP_addresses[0] && bearer_token == allowed_tokens[0],
    );

    this.logger.debug(
      IP == allowed_IP_addresses[1] && bearer_token == allowed_tokens[1],
    );

    // check if this server is included
    if (
      (IP == allowed_IP_addresses[0] && bearer_token == allowed_tokens[0]) ||
      (IP == allowed_IP_addresses[1] && bearer_token == allowed_tokens[1])
    ) {
      return true;
    } else {
      false;
    }
  }

  // guard logic
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: AuthenticatedUserRequestInterInterface = context
      .switchToHttp()
      .getRequest();

    // get the IP address and the token from the req's cookies
    const IP_Address = req.socket.remoteAddress || null;
    const bearer_token =
      req.headers?.authorization &&
      req.headers?.authorization.split('Bearer')[1]
        ? req.headers?.authorization.split('Bearer')[1]
        : null;

    if (!bearer_token || !IP_Address) {
      throw new HttpException('Access Denied4', HttpStatus.UNAUTHORIZED);
    }

    // verify if this server have the access
    if (this.IsServerAllowed(IP_Address, bearer_token.trim())) {
      return true;
    } else {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }
  }
}
