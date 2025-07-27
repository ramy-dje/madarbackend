import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Headers,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserInterface } from '../../user/interfaces/create-user.interface';
import { AuthService } from '../services/auth.service';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import {
  RegisterUserValidationSchema,
  RegisterUserValidationSchemaType,
} from '../validation/register-user.schema';
import {
  LoginUserValidationSchema,
  LoginUserValidationSchemaType,
} from '../validation/login-user.schema';
import { JwtBodyInterface } from '../../jwt/interfaces/jwt-body.interface';
import { AuthenticatedUserRequestInterInterface } from '../interfaces/authenticated-user-request.interface';
import { AuthGuard } from '../guards/auth.guard';
import { CookiesConstants } from '../../jwt/constants';
import { ServerAuthGuard } from '../guards/server-auth.guard';
import { Public } from '../decorators/public.decorator';
import {
  ServerUserTokensValidationSchema,
  ServerUserTokensValidationSchemaType,
} from '../validation/server-tokens-schema';
import { UserAccessInfoInterface } from '../../user/interfaces/user-access.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

@Controller('auth')
export class AuthController {
  logger = new Logger('AuthController');
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  // register the user
  @Post('register')
  @Public()
  async register(
    @Body(new ZodValidationPipe(RegisterUserValidationSchema))
    body: RegisterUserValidationSchemaType,
  ): Promise<CreateUserInterface> {
    const user = await this.authService.Register(body as CreateUserInterface);
    return user;
  }

  // login the user
  @HttpCode(200)
  @Post('login')
  @Public()
  async login(
    @Req() req: AuthenticatedUserRequestInterInterface,
    @Res({ passthrough: true }) res: Response,
    @Headers('origin') origin: string,
    @Body(new ZodValidationPipe(LoginUserValidationSchema))
    body: LoginUserValidationSchemaType,
  ) {
    const { role, ...tokens } = await this.authService.Login(
      body as Required<LoginUserValidationSchemaType>,
    );
    const prod = process.env.NODE_ENV === 'production';
    const dev = process.env.NODE_ENV === 'development';

    const domain = prod
      ? process.env.SERVER_DOMAIN
      : dev
        ? process.env.SERVER_DOMAIN_DEV
        : undefined;

    // Check the login resource (if this login is from the dashboard or the marketing site) (In Production)
    if (prod) {
      const host_resource = origin;
      this.logger.log(`Host Resource: ${host_resource}`);
      // if he's trying to login to the dashboard and he's just a client
      if (host_resource.includes('admin.hotelralf.com') && role == 'User') {
        throw new HttpException('Access Denied1', HttpStatus.FORBIDDEN);
      }
    }

    // expiration date
    const expires = ms(process.env.AUTH_REFRESH_TOKEN_EXPIRE || '30 days');

    if (tokens) {
      // setting the cookies
      res.cookie(CookiesConstants.accessToken, tokens.accessToken, {
        httpOnly: true,
        path: '/',
        secure: prod,
        maxAge: expires,
        sameSite: 'lax',
        ...(prod && {
          domain,
        }),
      });
      res.cookie(CookiesConstants.refreshToken, tokens.refreshToken, {
        httpOnly: true,
        path: '/',
        secure: prod,
        maxAge: expires,
        sameSite: 'lax',
        ...(prod && {
          domain,
        }),
      });
    }
    return { accessToken: tokens.accessToken };
  }

  // Refresh Data
  @Get('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ) {
    const tokens = await this.authService.Refresh(req.user.id);

    const prod = process.env.NODE_ENV === 'production';
    const domain = process.env.SERVER_DOMAIN;

    // expiration date
    const expires = ms(process.env.AUTH_REFRESH_TOKEN_EXPIRE || '30 days');

    if (tokens) {
      // setting the cookies
      res.cookie(CookiesConstants.accessToken, tokens.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: expires,
        secure: prod,
        sameSite: 'lax',
        ...(prod && {
          domain,
        }),
      });
      res.cookie(CookiesConstants.refreshToken, tokens.refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: expires,
        secure: prod,
        sameSite: 'lax',
        ...(prod && {
          domain,
        }),
      });
    }
    return { accessToken: tokens.accessToken };
  }

  // logout
  @Post('logout')
  logout(
    @Req() req: AuthenticatedUserRequestInterInterface,
    @Res() res: Response,
  ) {
    const user: JwtBodyInterface = req?.user;
    if (!user)
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);

    // secure logic
    const prod = process.env.NODE_ENV === 'production';
    const domain = process.env.SERVER_DOMAIN;

    // delete the cookies
    res.clearCookie(CookiesConstants.accessToken, {
      httpOnly: true,
      path: '/',
      secure: prod,
      sameSite: 'lax',
      ...(prod && {
        domain,
      }),
    });
    res.clearCookie(CookiesConstants.refreshToken, {
      httpOnly: true,
      path: '/',
      secure: prod,
      sameSite: 'lax',
      ...(prod && {
        domain,
      }),
    });
    throw new HttpException('unauthenticated', HttpStatus.OK);
  }

  // is authenticated
  @Get('is-authenticated')
  IsAuthenticated(@Req() req: AuthenticatedUserRequestInterInterface): {
    authenticated: boolean;
    data: JwtBodyInterface;
  } {
    const user: JwtBodyInterface = req?.user;
    if (!user)
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    return { authenticated: true, data: user };
  }

  // SERVER Endpoint (Endpoints will be accessed just by the dashboard's server in our case Next.Js)

  // are user's cookies authenticated (SERVER ONLY ACCESS)
  @Post('server/is-authenticated')
  @HttpCode(200)
  @Public()
  @UseGuards(ServerAuthGuard)
  async server_is_user_tokens_valid(
    @Body(new ZodValidationPipe(ServerUserTokensValidationSchema))
    tokens: ServerUserTokensValidationSchemaType,
  ) {
    try {
      const user = await this.authService.server_is_user_tokens_valid({
        acc: tokens.access_token,
        ref: tokens.refresh_token,
      });
      return { authenticated: true, data: user };
    } catch {
      return { authenticated: false, data: null };
    }
  }

  // Get the user's role & permissions
  @Post('server/access')
  @HttpCode(200)
  @Public()
  @UseGuards(ServerAuthGuard)
  async server_get_user_role_and_permissions(
    @Body(new ZodValidationPipe(ServerUserTokensValidationSchema))
    tokens: ServerUserTokensValidationSchemaType,
  ): Promise<{
    access: UserAccessInfoInterface | null;
    authenticated: boolean;
  }> {
    try {
      // Check if the user is authenticated
      const user = await this.authService.server_is_user_tokens_valid({
        acc: tokens.access_token,
        ref: tokens.refresh_token,
      });

      // Get the user access info (role & permissions)
      const info = await this.authService.server_get_user_access_info(user.id);

      // prepare access info
      const access_info: UserAccessInfoInterface | null =
        info.permissions && info.role
          ? {
              role: info.role,
              active: info.active,
              permissions: info.permissions,
            }
          : null;

      return { authenticated: true, access: access_info };
    } catch {
      return { authenticated: false, access: null };
    }
  }
}
