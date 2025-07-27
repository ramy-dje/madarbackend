import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilePermission } from '../../enums/file-permission.enum';

export class ShareRoleDto {
  @IsNotEmpty()
  roleId: string;

  @IsEnum(FilePermission)
  @IsNotEmpty()
  permission: FilePermission;
}
