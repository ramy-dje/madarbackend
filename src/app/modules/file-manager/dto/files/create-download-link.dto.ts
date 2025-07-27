import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDownloadLinkDto {
  @ApiPropertyOptional({
    description:
      'Optional duration for which the link should be valid (in seconds). Defaults to 1 hour.',
    example: 3600, // 1 hour
    type: Number,
    minimum: 60, // Min 1 minute
    maximum: 604800, // Max 7 days
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(604800) // Set a reasonable max expiry (e.g., 7 days = 60 * 60 * 24 * 7)
  expiresInSeconds?: number;
}
