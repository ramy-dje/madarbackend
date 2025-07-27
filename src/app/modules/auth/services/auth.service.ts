import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../../user/interfaces/user.interface';
import { UserService } from '../../user/services/user.service';
import { CreateUserInterface } from '../../user/interfaces/create-user.interface';
import { LogicUserInterface } from '../interfaces/login-user.interface';
import { JwtBodyInterface } from '../../jwt/interfaces/jwt-body.interface';
import { compare } from 'bcryptjs';
import { JwtService } from '../../jwt/services/jwt.service';
import { CoreService } from 'src/core/services/core.service';
import { RoleInterfaceDocumentType } from '../modules/role/interfaces/role.interface';
import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectModel('Users') private UserModel: Model<UserInterface>,

    @Inject(JwtService)
    private readonly jwtService: JwtService,

    @Inject(CoreService)
    private readonly coreService: CoreService,

    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  // Register
  async Register(
    user: Omit<CreateUserInterface, 'oauth' | 'oauthProvider'>,
  ): Promise<CreateUserInterface> {
    const newUser = await this.userService.createUser(
      {
        ...user,
        oauth: false,
        oauthProvider: '',
      },
      true, // to create the contact after saving the user
    );
    return newUser;
  }

  // Login
  async Login(body: LogicUserInterface): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
  }> {
    // verifying the user
    const user = await this.userService.getUserByEmail(body.email);
    if (!user)
      throw new HttpException('No user with this email', HttpStatus.NOT_FOUND);

    // check if the user account is active
    if (user.access?.active !== undefined && user.access?.active == false)
      throw new HttpException('Account Is Inactive', HttpStatus.FORBIDDEN);

    // checking the passwords
    const match = await this.comparePasswords(
      body.password,
      user.access.password,
    );
    if (!match)
      throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);

    try {
      // generating the tokens
      const jwtBody: JwtBodyInterface = {
        id: user._id.toString(),
        role: (user.access.role as RoleInterfaceDocumentType).name,
        email: user.profileInfo.email,
        fullName: user.profileInfo.fullName,
        username: user.profileInfo.username,
        gender: user.profileInfo.gender || 'male',
        location: user.profileInfo.location as any,
        phoneNumber: user.profileInfo.phoneNumber,
        pic: user.profileInfo.pic,
      };

      const accessToken = await this.jwtService.generateAccessToken(jwtBody);
      const refreshToken = await this.jwtService.generateRefreshToken(jwtBody);

      return {
        accessToken,
        role: (user.access.role as RoleInterfaceDocumentType).name,
        refreshToken,
      };
    } catch (err) {
      this.logger.error('Error generating tokens', err);
      throw new HttpException('Server Error', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  // refresh token
  async Refresh(user_id: string) {
    try {
      // check the user
      await this.checkUserAndRole(user_id);
      // get the user data
      const user = await this.UserModel.findById(
        user_id,
        {},
        {
          // populate the role
          populate: 'access.role',
          lean: true,
        },
      );

      // generating the tokens
      const jwtBody: JwtBodyInterface = {
        id: user._id.toString(),
        role: (user.access.role as any as RoleInterfaceDocumentType).name,
        fullName: user.profileInfo.fullName,
        email: user.profileInfo.email,
        username: user.profileInfo.username,
        gender: user.profileInfo.gender || 'male',
        location: user.profileInfo.location as any,
        phoneNumber: user.profileInfo.phoneNumber,
        pic: user.profileInfo.pic,
      };

      const accessToken = await this.jwtService.generateAccessToken(jwtBody);
      const refreshToken = await this.jwtService.generateRefreshToken(jwtBody);

      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(
          'Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // login oauth
  async LoginOAuth(email: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // verifying the user
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new HttpException('No user with this email', HttpStatus.NOT_FOUND);
    }

    // if the user isn't oauth
    if (!user.access.oauth) {
      throw new HttpException('No user with this email', HttpStatus.NOT_FOUND);
    }

    try {
      // generating the tokens
      const jwtBody: JwtBodyInterface = {
        id: user._id.toString(),
        role: (user.access.role as any as RoleInterfaceDocumentType).name,
        fullName: user.profileInfo.fullName,
        email: user.profileInfo.email,
        username: user.profileInfo.username,
        gender: user.profileInfo.gender || 'male',
        location: user.profileInfo.location as any,
        phoneNumber: user.profileInfo.phoneNumber,
        pic: user.profileInfo.pic,
      };

      const accessToken = await this.jwtService.generateAccessToken(jwtBody);
      const refreshToken = await this.jwtService.generateRefreshToken(jwtBody);

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new HttpException('Server Error', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  // check user with role
  async checkUserAndRole(
    user_id: string,
    role?: string,
  ): Promise<{
    email: string;
    role: {
      id: string;
      color: string;
      name: string;
    };
    permissions: SystemPermissions[];
    id: string;
  }> {
    // check if the user ID is valid
    if (!this.coreService.isValid_ObjectId(user_id)) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // getting the user
    const user = await this.UserModel.findById(
      user_id,
      {
        // getting just the needed fields
        'profileInfo.email': true,
        'access.role': true,
      },
      {
        // populate the role
        populate: 'access.role',
        lean: true, // to return lightweight document
      },
    );

    // verifying if the user doesn't exist
    if (!user) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // checking the role
    if (role) {
      if (
        role !== (user.access.role as any as RoleInterfaceDocumentType).name
      ) {
        throw new HttpException('Access Denied5', HttpStatus.FORBIDDEN);
      }
    }

    // return the user
    return {
      email: user.profileInfo.email,
      id: user._id.toString(),
      permissions: (user.access.role as any as RoleInterfaceDocumentType)
        .permissions as SystemPermissions[],
      role: {
        color: (user.access.role as any as RoleInterfaceDocumentType).color,
        id: (
          user.access.role as any as RoleInterfaceDocumentType
        )._id.toString(),
        name: (user.access.role as any as RoleInterfaceDocumentType).name,
      },
    };
  }

  // server is user tokens valid
  async server_is_user_tokens_valid(tokens: { acc: string; ref: string }) {
    try {
      // verify the refresh tokens
      const verify_refreshToken = this.jwtService.verifyRefreshToken(
        tokens.ref,
      );

      if (verify_refreshToken) {
        return verify_refreshToken;
      } else {
        throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
      }
    } catch {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }
  }

  // server get the user access info (role & permissions)
  async server_get_user_access_info(user_id: string) {
    return await this.userService.get_user_permissions(user_id);
  }

  // verifying passwords
  private async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await compare(password, hashedPassword);
    } catch {
      return false;
    }
  }
}
