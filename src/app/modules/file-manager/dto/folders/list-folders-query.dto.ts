import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

export class ListFoldersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter folders by parent folder ID. Omit or send "null" to list root folders.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined && v !== 'null')
  @IsMongoId({ message: 'parentId must be a valid MongoDB ObjectId string.' })
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Search term to filter folders by name (case-insensitive).',
    example: 'Quarterly Reports',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
