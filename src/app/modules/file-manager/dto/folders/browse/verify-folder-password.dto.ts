import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class VerifyFolderPasswordDto {
  @ApiProperty({
    description: 'Password required to access the protected folder',
    example: 'S3cureP@ss!',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
