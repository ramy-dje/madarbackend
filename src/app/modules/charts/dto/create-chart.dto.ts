import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from '../../../shared/enums/status.enum';

export class CreateChartDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  chartType: string;

  @IsObject()
  @IsNotEmpty()
  dataSource: Record<string, any>;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
