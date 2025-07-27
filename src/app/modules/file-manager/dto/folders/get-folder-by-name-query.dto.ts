import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, ValidateIf } from 'class-validator';
import { FolderName } from '../../enums/folders/folder-name.enum';

export class GetFolderByNameQueryDto {
  @ApiPropertyOptional({
    enum: FolderName,
    description: 'Filter folders by name',
    required: true,
  })
  @IsString()
  name: FolderName;

  @ApiPropertyOptional({
    description:
      'Get folder by parent folder ID. Omit or send "null" to get root folder.',
    example: '605c72a4b3f8a74a5b6f3c9d',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined && v !== 'null')
  @IsMongoId({ message: 'parentId must be a valid MongoDB ObjectId string.' })
  @IsString()
  parentId?: string | null;
}
