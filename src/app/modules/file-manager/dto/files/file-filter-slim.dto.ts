import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { FileType } from '../../enums/file-type.enum';

// Local Imports

export class FileFilterSlimQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by file type category.',
    enum: FileType, //* Document the enum values
    example: FileType.DOCUMENT,
  })
  @IsOptional()
  @IsEnum(FileType, {
    message: `type must be one of the following: ${Object.values(FileType).join(', ')}`,
  })
  type?: FileType;

  @ApiPropertyOptional({
    description:
      'Find by list of IDs. Can be provided as multiple `ids` params or a comma-separated string.',
    example: ['605c72a4b3f8a74a5b6f3c9d', '605c72a4b3f8a74a5b6f3c9e'],
    type: [String],
  })
  @IsOptional()
  ids?: string[] | string; // Array of IDs or a single comma-separated string
}
