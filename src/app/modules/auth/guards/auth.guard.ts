import { Response } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthenticatedUserRequestInterInterface } from '../interfaces/authenticated-user-request.interface';
import { JwtBodyInterface } from '../../jwt/interfaces/jwt-body.interface';
import { CookiesConstants } from '../../jwt/constants';
import { JwtService } from '../../jwt/services/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

@Injectable()
export class AuthGuard implements CanActivate {
  logger = new Logger('AuthGuard');
  constructor(
    @Inject(JwtService)
    private readonly JwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const req: AuthenticatedUserRequestInterInterface = context
      .switchToHttp()
      .getRequest();
    const res: Response = context.switchToHttp().getResponse();

    // get the tokens from the req's cookies
    const accessToken = req.cookies[CookiesConstants.accessToken];
    const refreshToken = req.cookies[CookiesConstants.refreshToken];

    if (!accessToken || !refreshToken)
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);

    // verify the access token
    const verify_accessToken = this.JwtService.verifyAccessToken(accessToken);
    const verify_refreshToken =
      this.JwtService.verifyRefreshToken(refreshToken);
    // if the access expired and the refresh token is valid
    if (!verify_accessToken && verify_refreshToken) {
      // generate new access token
      const body: JwtBodyInterface = {
        id: verify_refreshToken.id,
        role: verify_refreshToken.role,
        fullName: verify_refreshToken.fullName,
        email: verify_refreshToken.email,
        username: verify_refreshToken.username,
        gender: verify_refreshToken.gender || 'male',
        location: verify_refreshToken.location,
        phoneNumber: verify_refreshToken.phoneNumber,
        pic: verify_refreshToken.pic,
      };

      const newAccessToken = this.JwtService.generateAccessToken(body);

      // prod
      const prod = process.env.NODE_ENV === 'production';
      // domain
      const domain = process.env.SERVER_DOMAIN;

      // expiration date

      // setting the cookies
      res.cookie(CookiesConstants.accessToken, newAccessToken, {
        httpOnly: true,
        path: '/',
        secure: prod,
        maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRE || '30 days'),
        sameSite: 'lax',
        ...(prod && {
          domain,
        }),
      });

      // setting the user ojb in the req
      req.user = verify_refreshToken;
      return true;
    } else if (verify_accessToken && verify_refreshToken) {
      // if the token are valid
      // setting the user ojb in the req
      req.user = verify_accessToken;
      return true;
    } else {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }
  }
}
