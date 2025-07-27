import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { FilePermission } from 'src/app/modules/file-manager/enums/file-permission.enum';

export class SharedWithPermissionDto {
  @ApiProperty({
    description: 'Permission level granted to the principal.',
    enum: FilePermission,
    example: FilePermission.READ,
  })
  @IsNotEmpty({ message: 'Permission is required.' })
  @IsEnum(FilePermission, {
    message: `Permission must be one of: ${Object.values(FilePermission).join(', ')}`,
  })
  permission: FilePermission;
}
