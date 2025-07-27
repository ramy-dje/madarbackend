import { PartialType } from '@nestjs/mapped-types';
import { CreateLayoutConfigDto } from './create-layout-config.dto';

export class UpdateLayoutConfigDto extends PartialType(CreateLayoutConfigDto) {} 