import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileManagerService } from '../services/FileManagerService.service';
import { AuthenticatedUserRequestInterInterface } from '../../auth/interfaces/authenticated-user-request.interface';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthRole } from '../../auth/guards/role.guard';

@ApiTags('fm-analytics')
@Controller('v1/fm-analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard, AuthRole([], []))
export class AnalyticsController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get('storage')
  @ApiOperation({
    summary: 'Get storage analytics',
    description:
      'Retrieve detailed storage usage analytics including trends and file type breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Storage analytics retrieved successfully',
  })
  async getStorageAnalytics(
    @Request() req: AuthenticatedUserRequestInterInterface,
  ): Promise<any> {
    return this.fileManagerService.getStorageAnalytics(req.user);
  }
}
