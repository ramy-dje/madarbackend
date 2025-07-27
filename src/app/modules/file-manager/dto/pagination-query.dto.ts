import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';

export class PaginationQueryDto implements PaginationQueryInterface {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size?: number = 10;
}
