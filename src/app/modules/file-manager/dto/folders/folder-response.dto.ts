import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '../../enums/entity-type.enum';

export class FolderResponseDto {
  @ApiProperty({ example: '6631e1841bd334c3d59e235a' })
  id: string;

  @ApiProperty({ example: 'My Documents' })
  name: string;

  @ApiProperty({ example: '662f6e94bb1234a2a9ab1b9e', nullable: true })
  parentId: string | null;

  @ApiProperty({
    type: [String],
    example: ['662f6e94bb1234a2a9ab1b9e', '6630f7e44a23aa27cb2fef22'],
  })
  ancestors: string[];

  @ApiProperty({ enum: EntityType })
  ownerType: EntityType;

  @ApiProperty({ example: '6630f7e44a23aa27cb2fef22' })
  owner: string;

  @ApiProperty({ example: 4 })
  filesCount: number;

  @ApiProperty({ example: 10485760 }) // 10 MB
  totalSize: number;

  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z', nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ example: '6631e1841bd334c3d59e235a', nullable: true })
  deletedBy: string | null;

  @ApiProperty({ example: '2024-04-10T15:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-12T10:30:00.000Z' })
  updatedAt: Date;
}
