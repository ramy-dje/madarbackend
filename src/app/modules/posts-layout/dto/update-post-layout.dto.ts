import { PartialType } from '@nestjs/mapped-types';
import { CreatePostLayoutDto } from './create-post-layout.dto';

export class UpdatePostLayoutDto extends PartialType(CreatePostLayoutDto) {}
