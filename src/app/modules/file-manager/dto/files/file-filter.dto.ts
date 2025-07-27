import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';
import { FileType } from '../../enums/file-type.enum';

export class FileFilterDTO extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  ownerType?: string; // 'User', 'Admin', or 'Application'

  @IsOptional()
  @IsString()
  owner?: string; // ID of the User, Admin, or Application

  @IsOptional()
  @IsString()
  type?: FileType; // FileType enum value

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD format
}
