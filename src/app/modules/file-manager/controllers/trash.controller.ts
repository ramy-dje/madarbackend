import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUserRequestInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';
import { FileManagerService } from '../services/FileManagerService.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthRole } from '../../auth/guards/role.guard';

@Controller('v1/trash')
@UseGuards(AuthGuard, AuthRole([], []))
export class TrashController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get()
  @ApiOperation({ summary: 'List all folders and files in trash' })
  listTrash(@Req() req: AuthenticatedUserRequestInterInterface): Promise<any> {
    return this.fileManagerService.listTrash(req.user);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all folders and files in trash' })
  emptyTrash(@Req() req: AuthenticatedUserRequestInterInterface): Promise<any> {
    return this.fileManagerService.emptyTrash(req.user);
  }
}
