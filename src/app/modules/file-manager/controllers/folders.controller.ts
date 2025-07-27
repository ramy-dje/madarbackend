import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

// Local Imports
import { AuthenticatedUserRequestInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import { BrowseQueryDto } from '../dto/folders/browse/browse-query.dto';
import { BrowseResponseDto } from '../dto/folders/browse/browse-response.dto';
import { CreateFolderDto } from '../dto/folders/create-folder.dto';
import { ListFoldersQueryDto } from '../dto/folders/list-folders-query.dto';
import { PatchFolderQueryDto } from '../dto/folders/patch-folder.dto';
import { FileManagerService } from '../services/FileManagerService.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthRole } from '../../auth/guards/role.guard';
import { FolderResponseDto } from '../dto/folders/folder-response.dto';
import { SharedWithDto } from 'src/core/dto/shared-with.dto';
import { SharedWithPermissionDto } from 'src/core/dto/shared-with-permission.dto';
import { GetFolderByNameQueryDto } from '../dto/folders/get-folder-by-name-query.dto';
import { ShareRoleDto } from '../dto/folders/role-share.dto';
import { FilePermission } from '../enums/file-permission.enum';

@ApiTags('Folders & Browsing')
@ApiBearerAuth()
@Controller('v1/folders')
@UseGuards(AuthGuard, AuthRole([], []))
export class FoldersController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Folder created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFolderDto: CreateFolderDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.createFolder(createFolderDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List folders within a parent folder (or root)' })
  @ApiQuery({
    name: 'parentId',
    description: 'ID of the parent folder (omit or use "null" for root)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term for folder names',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'List of folders retrieved.' /* type: PaginatedFolderResponseDto */,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  async listFolders(
    @Query()
    listFoldersQueryDto: ListFoldersQueryDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<PaginatedResponse<FolderResponseDto[]>> {
    return this.fileManagerService.listFolders(req.user, listFoldersQueryDto);
  }

  @Get('by-name')
  @ApiQuery({
    type: GetFolderByNameQueryDto,
    description: 'Get folder by name',
  })
  @ApiOperation({ summary: 'Get folder by name' })
  getFolderByName(
    @Query() query: GetFolderByNameQueryDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getFolderByName(query, req.user);
  }
  @Get('browse')
  @ApiOperation({
    summary: 'Browse contents (folders and files) of a directory',
  })
  @ApiQuery({ type: BrowseQueryDto }) //* Documents query parameters via DTO
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of folders and files.',
    type: BrowseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent folder not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  browseFolder(
    @Query() query: BrowseQueryDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
    @Headers('X-Folder-Access-Password') folderPassword?: string,
  ): Promise<any> {
    return this.fileManagerService.browseFolder(
      req.user,
      query,
      folderPassword,
    );
  }

  @Post(':id/check-password')
  @ApiOperation({ summary: 'Check if the provided password is correct' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to check password for',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password is correct.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Incorrect password.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @HttpCode(HttpStatus.OK)
  checkPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.checkFolderPassword(
      id,
      body.password,
      req.user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific folder' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to retrieve',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Folder details retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getFolderMetadata(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getFolderMetadata(id, req.user);
  }

  @Get(':id/breadcrumbs')
  @ApiOperation({ summary: 'Get breadcrumbs for a folder' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to get breadcrumbs for',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Breadcrumbs retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permission denied.',
  })
  getBreadcrumbs(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getBreadcrumbs(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a folder (e.g., rename, move)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to update',
    type: String,
  })
  @ApiBody({ type: PatchFolderQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Folder updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  updateFolder(
    @Param('id') id: string,
    @Body() patchFolderQueryDto: PatchFolderQueryDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.updateFolder(
      id,
      patchFolderQueryDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Move a folder to trash (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to delete',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Folder moved to trash.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  softDeleteFolder(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.softDeleteFolder(id, req.user); //* Pass IP if service needs it
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete a folder' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to permanently delete',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Folder permanently deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDeleteFolder(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.hardDeleteFolder(id, req.user);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a folder from trash' })
  @ApiParam({
    name: 'id',
    description: 'ID of the folder to restore',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Folder restored successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.OK)
  restoreFolder(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.restoreFolder(id, req.user);
  }

  // ========================================================================== //
  // ==                               SHARE FOLDER                           == //
  // ========================================================================== //

  @Get(':id/share')
  @ApiOperation({ summary: 'Get sharing information for a folder' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sharing information for the folder.',
    schema: { type: 'object', properties: { shareInfo: { type: 'object' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getFolderShareInfo(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getFolderShareInfo(id, req.user);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a folder with specific users' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiBody({ type: SharedWithDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Folder sharing updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  shareFolder(
    @Param('id') id: string,
    @Body() sharedWithDto: { sharedWith: any[] },
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.shareFolder(id, sharedWithDto, req.user);
  }

  @Patch(':id/share/:principalId')
  @ApiOperation({ summary: 'Update sharing permissions for a specific user' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiParam({
    name: 'principalId',
    type: String,
    format: 'mongoId',
    description: 'User ID to update sharing permissions for',
  })
  @ApiBody({ type: SharedWithPermissionDto })
  @ApiResponse({
    type: SharedWithDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder or user not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  updateFolderSharingPermissions(
    @Param('id') id: string,
    @Param('principalId') principalId: string,
    @Body() sharedWithPermissionDto: SharedWithPermissionDto,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.updateFolderSharingPermissions(
      id,
      principalId,
      sharedWithPermissionDto,
      req.user,
    );
  }

  @Delete(':id/share/:principalId')
  @ApiOperation({ summary: 'Remove sharing for a specific user' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiParam({
    name: 'principalId',
    type: String,
    format: 'mongoId',
    description: 'User ID to remove sharing for',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sharing removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder or user not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 on successful deletion
  removeFolderSharing(
    @Param('id') id: string,
    @Param('principalId') principalId: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.removeFolderSharing(
      id,
      principalId,
      req.user,
    );
  }

  // ========================================================================== //
  // ==                         SHARE FOLDER WITH ROLES                      == //
  // ========================================================================== //
  @Get(':id/share-roles')
  @ApiOperation({ summary: 'Get all role-based shares for a folder' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role-based sharing information for the folder.',
    schema: { type: 'object', properties: { roleShares: { type: 'array' } } },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  getFolderRoleShares(
    @Param('id') id: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getFolderRoleShares(id, req.user);
  }

  @Post(':id/share-roles')
  @ApiOperation({ summary: 'Share a folder with one or more roles' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleShares: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              permission: { type: 'string', enum: ['view', 'edit', 'admin'] },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Folder shared with roles successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder not found or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  shareFolderWithRoles(
    @Param('id') id: string,
    @Body() shareRolesDto: ShareRoleDto[],
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.shareFolderWithRoles(
      id,
      shareRolesDto,
      req.user,
    );
  }

  @Patch(':id/share-roles/:roleId')
  @ApiOperation({ summary: 'Update permission for a specific role' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'Role ID to update permission for',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permission: { type: 'string', enum: ['view', 'edit', 'admin'] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role permission updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder or role share not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  updateFolderRoleSharePermission(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body('permission') permission: FilePermission,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.updateFolderRoleSharePermission(
      id,
      roleId,
      permission,
      req.user,
    );
  }

  @Delete(':id/share-roles/:roleId')
  @ApiOperation({ summary: 'Remove sharing for a specific role' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'mongoId',
    description: 'Folder ID',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'Role name to remove sharing for',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Role sharing removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Folder or role share not found, or access denied.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFolderRoleSharing(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Req() req: AuthenticatedUserRequestInterInterface,
  ): Promise<void> {
    return this.fileManagerService.removeFolderRoleSharing(
      id,
      roleId,
      req.user,
    );
  }
}
