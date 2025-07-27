import { IsOptional, IsString } from 'class-validator';

export class CreatePostLayoutDto {
  @IsString()
  @IsOptional()
  layoutType?: string;

  @IsString()
  @IsOptional()
  displayType?: string;

  @IsString()
  @IsOptional()
  navigationType?: string;

  @IsString()
  @IsOptional()
  sidebarWidgets?: string[];

  @IsString()
  @IsOptional()
  gridColumns?: number;
}
