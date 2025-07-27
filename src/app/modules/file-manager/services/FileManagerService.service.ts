// Node.js modules
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

// External dependencies
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

// Core imports
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { SharedWithDto } from 'src/core/dto/shared-with.dto';
import { SharedWithPermissionDto } from 'src/core/dto/shared-with-permission.dto';
import { throwIf } from 'src/core/exceptions/throw-if';

// Auth module imports
import { AuthenticatedUserInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';

// JWT module imports
import { JwtService } from '../../jwt/services/jwt.service';
import {
  FileManagerPermissions,
  JwtBodyFileManagerInterface,
} from '../../jwt/interfaces/jwt-body.interface';

// File Manager module imports
import { FileManagerConfig } from '../config/file-manager.config';
import { AuthResponse } from '../interfaces/fm-auth-response.interface';
import { FileResponse } from '../interfaces/file-response.interface';

// File-related DTOs
import { CreateFileDto } from '../dto/files/create-file.dto';
import { FileFilterDTO } from '../dto/files/file-filter.dto';
import { UpdateFileDto } from '../dto/files/update-file.dto';

// Folder-related DTOs
import { CreateFolderDto } from '../dto/folders/create-folder.dto';
import { PatchFolderQueryDto } from '../dto/folders/patch-folder.dto';
import { ListFoldersQueryDto } from '../dto/folders/list-folders-query.dto';
import { FolderResponseDto } from '../dto/folders/folder-response.dto';
import { BrowseQueryDto } from '../dto/folders/browse/browse-query.dto';
import { MailService } from '../../mailer/mailer.service';
import { UserService } from '../../user/services/user.service';
import { FolderAccessibility } from '../enums/folders/folder-accessibility.enum';
import { handleRequestError } from 'src/core/interceptors/file-manager-service.interceptor';
import { GetFolderByNameQueryDto } from '../dto/folders/get-folder-by-name-query.dto';
import { ShareRoleDto } from '../dto/folders/role-share.dto';
import { FilePermission } from '../enums/file-permission.enum';
import { RoleService } from '../../auth/modules/role/services/role.service';

@Injectable()
export class FileManagerService implements OnModuleInit {
  private readonly logger = new Logger(FileManagerService.name);
  private readonly config: FileManagerConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {
    this.config = this.configService.get<FileManagerConfig>('fileManager');
    throwIf(
      !this.config,
      'FileManagerService: Configuration missing. Ensure FileManagerConfig is loaded.',
    );
  }

  /**
   * No longer authenticates application on module init.
   */
  async onModuleInit() {
    this.logger.log('INIT: File Manager Service ready (no application login).');
  }

  // ========================================================================== //
  // ==                 PRIVATE REQUEST & ERROR HELPERS                      == //
  // ========================================================================== //

  private async _makeRequest<T>(
    method: AxiosRequestConfig['method'],
    path: string,
    options: AxiosRequestConfig = {},
    user: JwtBodyFileManagerInterface,
  ): Promise<T> {
    try {
      if (!user) {
        throw new HttpException(
          'User context is required for File Manager operations.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const userToken = this.jwtService.generateFileManagerToken(user);
      const url = `${this.config.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
      // Prepare headers
      const headers = {
        ...options.headers,
        "x-forwarded-user-authorization": `Bearer ${userToken}`,
        Accept: 'application/json',
      };
 

      const config: AxiosRequestConfig = {
        ...options,
        headers,
        url,
        method,
        timeout:
          options.timeout ||
          this.configService.get<number>('HTTP_TIMEOUT', 15000),
      };
      const response = await firstValueFrom(
        this.httpService
          .request<T>(config)
          .pipe(catchError(handleRequestError())),
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Request failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`File Manager request failed: ${error.message}`);
    }
  }

  private _mapUserToFileManagerContext(
    user: AuthenticatedUserInterInterface,
  ): JwtBodyFileManagerInterface {
    if (!user) {
      throw new HttpException(
        'User context is required for File Manager operations.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    // Filter permissions to include only FileManagerPermissions
    const fileManagerPermissions: FileManagerPermissions[] =
      (user.access?.permissions?.filter((permission) =>
        permission.startsWith('file_manager'),
      ) as FileManagerPermissions[]) || [];
    return {
      id: user.id,
      role: user.role,
      access: {
        role: user.access?.role,
        permissions: fileManagerPermissions,
      },
    };
  }



  // ========================================================================== //
  // ==                        PUBLIC FILE METHODS                           == //
  // ========================================================================== //

  /**
   * Uploads a file to the File Manager service.
   *
   * @param {Express.Multer.File} file Multer file object containing buffer, originalname, mimetype.
   * @param {CreateFileDto} createFileDto DTO with optional folderId, tags.
   * @returns {Promise<FileResponse>} Metadata of the uploaded file.
   * @throws {HttpException} If upload fails.
   */
  async uploadFile(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
    user: AuthenticatedUserInterInterface,
    accessToken?: string,
  ): Promise<FileResponse> {
    this.logger.log(
      `UPLOAD: Initiating upload for: ${file.originalname} (Size: ${file.size} bytes)`,
    );
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    if (createFileDto.folderId) {
      formData.append('folderId', createFileDto.folderId);
    }
    if (createFileDto.tags && createFileDto.tags.length > 0) {
      // Ensure backend handles 'tags[]' correctly for arrays in FormData
      createFileDto.tags.forEach((tag) => formData.append('tags[]', tag));
    }

    const headers = formData.getHeaders(); // Includes Content-Type: multipart/form-data

    return this._makeRequest<FileResponse>(
      'post',
      '/v1/files/upload',
      {
        data: formData,
        headers,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    createFileDto: CreateFileDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any[]> {
    this.logger.log(
      `CREATE_MULTIPLE: Initiating upload for ${files.length} files.`,
    );

    if (!user.access?.permissions?.includes('file_manager:create')) {
      throw new HttpException(
        'You do not have permission to upload files.',
        HttpStatus.FORBIDDEN,
      );
    }

    const formData = new FormData();

    const headers = formData.getHeaders();

    files.forEach((file) => {
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    if (createFileDto.folderId) {
      formData.append('folderId', createFileDto.folderId);
    }

    if (createFileDto.sharedWith) {
      formData.append('sharedWith', JSON.stringify(createFileDto.sharedWith));
    }

    if (createFileDto.sharedWithRoles) {
      formData.append(
        'sharedWithRoles',
        JSON.stringify(createFileDto.sharedWithRoles),
      );
    }

    this.logger.debug('sharedWith', createFileDto.sharedWith);
    this.logger.debug('sharedWithRoles', createFileDto.sharedWithRoles);

    if (createFileDto.altText) {
      formData.append('altText', createFileDto.altText);
    }

    return this._makeRequest<FileResponse[]>(
      'post',
      '/v1/files/upload-multiple',
      { data: formData, headers },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Lists files from the File Manager service based on filter criteria.
   *
   * @param {FileFilterDTO} fileFilterDTO DTO containing pagination and filter options.
   * @returns {Promise<PaginatedResponse<FileResponse>>} Paginated list of file metadata.
   * @throws {HttpException} If request fails.
   */
  async listFiles(
    fileFilterDTO: FileFilterDTO,
    user: AuthenticatedUserInterInterface,
  ): Promise<PaginatedResponse<FileResponse>> {
    return this._makeRequest<PaginatedResponse<FileResponse>>(
      'get',
      '/v1/files',
      {
        params: fileFilterDTO,
        headers: {
          Accept: 'application/json',
        },
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async listFilesApplicationSlim(
    user: AuthenticatedUserInterInterface,
    ids?: string[] | string,
  ): Promise<PaginatedResponse<any>> {
    this.logger.debug(
      `LIST_FILES_APPLICATION_SLIM: Requesting files with IDs: ${ids}`,
    );
    return this._makeRequest<PaginatedResponse<any>>(
      'get',
      '/v1/files/application/slim',
      {
        params: {
          ids: String(ids),
        },
        headers: {
          Accept: 'application/json',
        },
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Retrieves metadata for a specific file.
   *
   * @param {string} fileId The ID of the file.
   * @returns {Promise<FileResponse>} File metadata.
   * @throws {HttpException} If request fails or file not found.
   */
  async getFileMetadata(
    fileId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<FileResponse> {
    this.logger.debug(`GET_META: Requesting metadata for file ID: ${fileId}`);
    return this._makeRequest<any>(
      'get',
      `/v1/files/${fileId}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Retrieves a temporary pre-signed download URL for a file.
   *
   * @param {string} fileId The ID of the file.
   * @returns {Promise<{ downloadUrl: string }>} Object containing the download URL.
   * @throws {HttpException} If request fails or file not found.
   */
  async getDownloadUrl(
    fileId: string,
    user: AuthenticatedUserInterInterface,
    expiresInSeconds?: number,
  ): Promise<{ downloadUrl: string }> {
    this.logger.debug(
      `GET_URL: Requesting download URL for file ID: ${fileId}`,
    );

    const params: Record<string, string | number> = {};
    if (expiresInSeconds) {
      params.expiresInSeconds = expiresInSeconds;
    }

    return this._makeRequest<{ downloadUrl: string }>(
      'get',
      `/v1/files/${fileId}/download`,
      { params },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Updates the metadata of a specific file.
   *
   * @param {string} fileId The ID of the file to update.
   * @param {UpdateFileDto} updateFileDto DTO containing fields to update.
   * @returns {Promise<FileResponse>} Updated file metadata.
   * @throws {HttpException} If request fails, file not found, or validation error.
   */
  async updateFile(
    fileId: string,
    updateFileDto: UpdateFileDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<FileResponse> {
    this.logger.log(`UPDATE_FILE: Updating file ID: ${fileId}`);
    return this._makeRequest<FileResponse>(
      'patch',
      `/v1/files/${fileId}`,
      {
        data: updateFileDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Moves a file to the trash (soft delete).
   *
   * @param {string} fileId The ID of the file to soft delete.
   * @returns {Promise<void>} Resolves on success.
   * @throws {HttpException} If request fails or file not found.
   */
  async softDeleteFile(
    fileId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.log(
      `SOFT_DELETE: Requesting soft delete for file ID: ${fileId}`,
    );
    await this._makeRequest<void>(
      'delete',
      `/v1/files/${fileId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Permanently deletes a file. Use with caution.
   *
   * @param {string} fileId The ID of the file to permanently delete.
   * @returns {Promise<void>} Resolves on success.
   * @throws {HttpException} If request fails or file not found.
   */
  async hardDeleteFile(
    fileId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.warn(
      `HARD_DELETE: Requesting permanent deletion for file ID: ${fileId}`,
    );
    await this._makeRequest<void>(
      'delete',
      `/v1/files/${fileId}/permanent`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async restoreFile(
    fileId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.log(`RESTORE: Requesting restore for file ID: ${fileId}`);
    await this._makeRequest<void>(
      'post',
      `/v1/files/${fileId}/restore`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                      FILE SHARING METHODS                            == //
  // ========================================================================== //

  async getShareInfo(
    fileId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `GET_SHARE_INFO: Requesting share info for file ID: ${fileId}`,
    );
    const shareInfo = await this._makeRequest<any>(
      'get',
      `/v1/files/${fileId}/share`,
      {},
      this._mapUserToFileManagerContext(user),
    );

    const userIds = shareInfo.sharedWith.map((user) => user.principalId);

    const users = await this.userService.get_user_info_by_ids(userIds);

    return users;
  }

  async shareFile(
    fileId: string,
    sharedWithDto: SharedWithDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `UPDATE_SHARE_INFO: Updating share info for file ID: ${fileId}`,
    );
    return this._makeRequest<any>(
      'post',
      `/v1/files/${fileId}/share`,
      {
        data: sharedWithDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async updateSharingPermissions(
    fileId: string,
    principalId: string,
    sharedWithPermissionDto: SharedWithPermissionDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `UPDATE_SHARE_PERMISSIONS: Updating sharing permissions for file ID: ${fileId}`,
    );
    return this._makeRequest<any>(
      'patch',
      `/v1/files/${fileId}/share/${principalId}`,
      {
        data: sharedWithPermissionDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async removeSharing(
    fileId: string,
    principalId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(`REMOVE_SHARE: Removing sharing for file ID: ${fileId}`);
    return this._makeRequest<any>(
      'delete',
      `/v1/files/${fileId}/share/${principalId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                      FOLDER SHARING METHODS                          == //
  // ========================================================================== //

  async getFolderShareInfo(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    const shareInfo = await this._makeRequest<any>(
      'get',
      `/v1/folders/${folderId}/share`,
      {},
      this._mapUserToFileManagerContext(user),
    );

    if (!shareInfo.sharedWith || shareInfo.sharedWith.length === 0) {
      return [];
    }

    const userIds = shareInfo.sharedWith.map((user) => user.principalId);
    const users = await this.userService.get_user_info_by_ids(userIds);

    return users;
  }

  async shareFolder(
    folderId: string,
    sharedWithDto: SharedWithDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `UPDATE_SHARE_INFO: Updating share info for folder ID: ${folderId}`,
    );
    return this._makeRequest<any>(
      'post',
      `/v1/folders/${folderId}/share`,
      {
        data: sharedWithDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async updateFolderSharingPermissions(
    folderId: string,
    principalId: string,
    sharedWithPermissionDto: SharedWithPermissionDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `UPDATE_SHARE_PERMISSIONS: Updating sharing permissions for folder ID: ${folderId}`,
    );
    return this._makeRequest<any>(
      'patch',
      `/v1/folders/${folderId}/share/${principalId}`,
      {
        data: sharedWithPermissionDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async removeFolderSharing(
    folderId: string,
    principalId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `REMOVE_SHARE: Removing sharing for folder ID: ${folderId}`,
    );
    return this._makeRequest<any>(
      'delete',
      `/v1/folders/${folderId}/share/${principalId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                   FOLDER ROLE-BASED SHARING METHODS                   == //
  // ========================================================================== //

  async getFolderRoleShares(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `GET_SHARE_ROLES: Requesting role-based share info for folder ID: ${folderId}`,
    );
    const response = await this._makeRequest<any>(
      'get',
      `/v1/folders/${folderId}/share-roles`,
      {},
      this._mapUserToFileManagerContext(user),
    );

    if (!response || response.length === 0) {
      return [];
    }

    const roleIds = response.map((role) => role.roleId);

    const roles = await this.roleService.get_roles_by_ids(roleIds);

    return response.map((role) => ({
      ...role,
      role: roles.find((r) => r.id === role.roleId),
    }));
  }

  async shareFolderWithRoles(
    folderId: string,
    shareRolesDto: ShareRoleDto[],
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `SHARE_WITH_ROLES: Updating role-based sharing for folder ID: ${folderId}`,
    );
    return this._makeRequest<any>(
      'post',
      `/v1/folders/${folderId}/share-roles`,
      {
        data: shareRolesDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async updateFolderRoleSharePermission(
    folderId: string,
    roleId: string,
    permission: FilePermission,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `UPDATE_ROLE_PERMISSION: Updating role permission for folder ID: ${folderId}, role: ${roleId}`,
    );

    this.logger.debug(`Permission: ${permission}`);
    return this._makeRequest<any>(
      'patch',
      `/v1/folders/${folderId}/share-roles/${roleId}`,
      {
        data: {
          permission,
        },
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async removeFolderRoleSharing(
    folderId: string,
    roleId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `REMOVE_ROLE_SHARE: Removing role-based sharing for folder ID: ${folderId}, role: ${roleId}`,
    );
    return this._makeRequest<any>(
      'delete',
      `/v1/folders/${folderId}/share-roles/${roleId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                      PUBLIC VERSION METHODS                          == //
  // ========================================================================== //

  async createVersion(
    fileId: string,
    file: Express.Multer.File,
    user: AuthenticatedUserInterInterface,
    changeDescription?: string,
  ): Promise<FileResponse> {
    this.logger.log(
      `CREATE_VERSION: Uploading new version for file: ${fileId}`,
    );
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    if (changeDescription) {
      formData.append('changeDescription', changeDescription);
    }
    const headers = formData.getHeaders();

    return this._makeRequest<FileResponse>(
      'post',
      `/v1/files/${fileId}/versions`,
      { data: formData, headers },
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Retrieves a temporary download URL for a specific file version.
   *
   * @param {string} fileId The ID of the parent file.
   * @param {string} versionId The ID of the specific version.
   * @returns {Promise<{ downloadUrl: string }>} Object containing the download URL.
   * @throws {HttpException} If request fails or version not found.
   */
  async generateVersionDownloadUrl(
    fileId: string,
    versionId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<{ downloadUrl: string }> {
    this.logger.debug(
      `GET_VERSION_URL: Requesting URL for file ${fileId}, version ${versionId}`,
    );
    return this._makeRequest<{ downloadUrl: string }>(
      'get',
      `/v1/files/${fileId}/versions/${versionId}/url`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                       PUBLIC FOLDER METHODS                          == //
  // ========================================================================== //

  /**
   * Creates a new folder in the File Manager.
   *
   * @param {string} name Name of the new folder.
   * @param {string | null} [parentId] Optional ID of the parent folder (null for root).
   * @returns {Promise<any>} Metadata of the created folder.
   * @throws {HttpException} If request fails.
   */
  async createFolder(
    createFolderDto: CreateFolderDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.log(`CREATE_FOLDER: Creating folder: ${createFolderDto.name}`);

    // check if user is authenticated and has permission to create folder
    if (!user.access?.permissions?.includes('file_manager:create')) {
      throw new HttpException(
        'You do not have permission to create a folder.',
        HttpStatus.FORBIDDEN,
      );
    }
    const folder = await this._makeRequest<any>(
      'post',
      '/v1/folders',
      {
        data: createFolderDto,
      },
      this._mapUserToFileManagerContext(user),
    );

    this.logger.log(`CREATE_FOLDER: Folder created with ID: ${folder.id}`);

    // Send email notification if folder is shared with others
    if (folder.sharedWith.length > 0) {
      this.logger.log(
        `CREATE_FOLDER: Sending email notification for shared folder ID: ${folder.id}`,
      );

      const userIds = folder.sharedWith.map((shared) => shared.principalId);

      if (!userIds || userIds.length === 0) {
        this.logger.warn(
          `CREATE_FOLDER: No user IDs found for shared folder ID: ${folder.id}`,
        );
        return folder;
      }

      const userEmails = await this.userService.get_user_emails_by_ids(userIds);

      // log emails for debugging
      this.logger.debug(
        `CREATE_FOLDER: Emails to be notified: ${JSON.stringify(userEmails)}`,
      );

      const password =
        createFolderDto.accessibility &&
        createFolderDto.accessibility === FolderAccessibility.PROTECTED
          ? createFolderDto.accessPassword
            ? createFolderDto.accessPassword
            : null
          : null;
      const link = `${process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000'}/en/file-manager?folderId=${folder.id}`;
      for (const email of userEmails) {
        await this.mailService.sendFolderSharedEmail(
          email,
          folder.name,
          password,
          link,
        );
      }
    }
    return folder;
  }

  async listFolders(
    user: AuthenticatedUserInterInterface,
    listFoldersQueryDto: ListFoldersQueryDto,
  ): Promise<PaginatedResponse<FolderResponseDto[]>> {
    this.logger.debug(
      `LIST_FOLDERS: Requesting folders with query: ${JSON.stringify(
        listFoldersQueryDto,
      )}`,
    );
    const params: Record<string, string | number> = {
      size: listFoldersQueryDto.size ?? 10,
      page: listFoldersQueryDto.page ?? 1,
    };
    if (listFoldersQueryDto.parentId) {
      params.parentId =
        listFoldersQueryDto.parentId === null
          ? 'null'
          : listFoldersQueryDto.parentId;
    }

    if (listFoldersQueryDto.search) {
      params.search = listFoldersQueryDto.search;
    }

    // check if user is authenticated and has permission to list folders
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to list folders.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this._makeRequest<PaginatedResponse<FolderResponseDto[]>>(
      'get',
      '/v1/folders',
      { params },
      this._mapUserToFileManagerContext(user),
    );
  }

  async getFolderByName(
    query: GetFolderByNameQueryDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    // check if user is authenticated and has permission to list folders
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to list folders.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this._makeRequest<any>(
      'get',
      '/v1/folders/by-name',
      { params: query },
      this._mapUserToFileManagerContext(user),
    );
  }

  async getFolderMetadata(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to read folder metadata.',
        HttpStatus.FORBIDDEN,
      );
    }
    return this._makeRequest<any>(
      'get',
      `/v1/folders/${folderId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async getBreadcrumbs(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to read folder metadata.',
        HttpStatus.FORBIDDEN,
      );
    }
    return this._makeRequest<any>(
      'get',
      `/v1/folders/${folderId}/breadcrumbs`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  /**
   * Updates a folder (e.g., rename, move).
   *
   * @param {string} folderId The ID of the folder to update.
   * @param {object} updateData Object containing fields to update (e.g., { name: 'New Name', parentId: '...' }).
   * @returns {Promise<any>} Updated folder metadata.
   * @throws {HttpException} If request fails or folder not found.
   */
  async updateFolder(
    folderId: string,
    patchFolderQueryDto: PatchFolderQueryDto,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    if (!user.access?.permissions?.includes('file_manager:update')) {
      throw new HttpException(
        'You do not have permission to update folder metadata.',
        HttpStatus.FORBIDDEN,
      );
    }
    return this._makeRequest<any>(
      'patch',
      `/v1/folders/${folderId}`,
      {
        data: patchFolderQueryDto,
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async softDeleteFolder(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.log(
      `SOFT_DELETE_FOLDER: Requesting soft delete for folder ID: ${folderId}`,
    );

    // check if user is authenticated and has permission to delete folder
    if (!user.access?.permissions?.includes('file_manager:delete')) {
      throw new HttpException(
        'You do not have permission to delete folder.',
        HttpStatus.FORBIDDEN,
      );
    }
    await this._makeRequest<void>(
      'delete',
      `/v1/folders/${folderId}`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async hardDeleteFolder(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.warn(
      `HARD_DELETE_FOLDER: Requesting permanent deletion for folder ID: ${folderId}`,
    );

    // check if user is authenticated and has permission to delete folder
    if (!user.access?.permissions?.includes('file_manager:delete')) {
      throw new HttpException(
        'You do not have permission to delete folder.',
        HttpStatus.FORBIDDEN,
      );
    }
    await this._makeRequest<void>(
      'delete',
      `/v1/folders/${folderId}/permanent`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async browseFolder(
    user: AuthenticatedUserInterInterface,
    browseQueryDto: BrowseQueryDto,
    folderPassword: string,
  ): Promise<any> {
    // check if user is authenticated and has permission to browse folders
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to browse folders.',
        HttpStatus.FORBIDDEN,
      );
    }

    const requestConfig: AxiosRequestConfig = {
      params: browseQueryDto,
    };

    // Add password header if provided
    if (folderPassword) {
      requestConfig.headers = {
        'X-Folder-Access-Password': folderPassword,
      };
    }

    const results = await this._makeRequest<any>(
      'get',
      '/v1/folders/browse',
      requestConfig,
      this._mapUserToFileManagerContext(user),
    );

    // Collect all user and role IDs at once to reduce database calls
    const allUserIds = new Set<string>();
    const allRoleIds = new Set<string>();

    // Extract all IDs from both folders and files
    for (const item of [...results.folders, ...results.files]) {
      item.sharedWith?.forEach(
        (user: { principalId: string; [key: string]: any }) =>
          allUserIds.add(user.principalId),
      );
      item.sharedWithRoles?.forEach(
        (role: { roleId: string; [key: string]: any }) =>
          allRoleIds.add(role.roleId),
      );
    }

    // Batch fetch all users and roles in single calls
    const [users, roles] = await Promise.all([
      allUserIds.size > 0
        ? this.userService.get_user_info_by_ids([...allUserIds])
        : [],
      allRoleIds.size > 0
        ? this.roleService.get_roles_by_ids([...allRoleIds])
        : [],
    ]);

    // Create lookup maps for efficient access
    interface UserMapEntry {
      id: string;
      [key: string]: any; // For other user properties
    }

    interface RoleMapEntry {
      id: string;
      [key: string]: any; // For other role properties
    }

    const userMap = new Map<string, UserMapEntry>(
      users.map(
        (user: UserMapEntry) => [user.id, user] as [string, UserMapEntry],
      ),
    );
    const roleMap = new Map<string, RoleMapEntry>(
      roles.map(
        (role: RoleMapEntry) => [role.id, role] as [string, RoleMapEntry],
      ),
    );

    // Process both folders and files with the same logic
    interface SharedWithItem {
      principalId: string;
      permission?: string;
      [key: string]: any;
    }

    interface SharedWithRoleItem {
      roleId: string;
      permission?: string;
      [key: string]: any;
    }

    interface BrowseItem {
      id: string;
      sharedWith?: SharedWithItem[];
      sharedWithRoles?: SharedWithRoleItem[];
      [key: string]: any;
    }

    const processSharing = (item: BrowseItem): void => {
      try {
        // Update sharedWith array with user info
        if (item.sharedWith?.length) {
          item.sharedWith = item.sharedWith.map((shared: SharedWithItem) => ({
            ...shared,
            ...userMap.get(shared.principalId),
          }));
        }

        // Update sharedWithRoles array with role info
        if (item.sharedWithRoles?.length) {
          item.sharedWithRoles = item.sharedWithRoles.map(
            (shared: SharedWithRoleItem) => ({
              ...shared,
              role: roleMap.get(shared.roleId),
            }),
          );
        }
      } catch (error: any) {
        this.logger.error(
          `Error updating sharing info for item ${item.id}: ${error.message}`,
        );
      }
    };

    // Apply processing to all items
    results.folders.forEach(processSharing);
    results.files.forEach(processSharing);

    return results;
  }

  async checkFolderPassword(
    folderId: string,
    folderPassword: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(
      `CHECK_FOLDER_PASSWORD: Checking password for folder ID: ${folderId}`,
    );

    // check if user is authenticated and has permission to browse folders
    if (!user.access?.permissions?.includes('file_manager:read')) {
      throw new HttpException(
        'You do not have permission to browse folders.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this._makeRequest<any>(
      'post',
      `/v1/folders/${folderId}/check-password`,
      {
        data: { password: folderPassword },
      },
      this._mapUserToFileManagerContext(user),
    );
  }

  async restoreFolder(
    folderId: string,
    user: AuthenticatedUserInterInterface,
  ): Promise<void> {
    this.logger.log(
      `RESTORE_FOLDER: Requesting restore for folder ID: ${folderId}`,
    );

    if (!user.access?.permissions?.includes('file_manager:delete')) {
      throw new HttpException(
        'You do not have permission to restore folder.',
        HttpStatus.FORBIDDEN,
      );
    }
    await this._makeRequest<void>(
      'patch',
      `/v1/folders/${folderId}/restore`,
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async listTrash(user: AuthenticatedUserInterInterface): Promise<any> {
    this.logger.debug(`LIST_TRASH: Requesting trash list`);
    return this._makeRequest<any>(
      'get',
      '/v1/trash',
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  async emptyTrash(user: AuthenticatedUserInterInterface): Promise<any> {
    this.logger.debug(`DELETE_TRASH: Requesting trash deletion`);
    return this._makeRequest<any>(
      'delete',
      '/v1/trash',
      {},
      this._mapUserToFileManagerContext(user),
    );
  }

  // ========================================================================== //
  // ==                       ANALYTICS METHODS                              == //
  // ========================================================================== //

  async getStorageAnalytics(
    user: AuthenticatedUserInterInterface,
  ): Promise<any> {
    this.logger.debug(`GET_STORAGE_ANALYTICS: Requesting storage analytics`);
    return this._makeRequest<any>(
      'get',
      '/v1/analytics/storage',
      {},
      this._mapUserToFileManagerContext(user),
    );
  }
}
