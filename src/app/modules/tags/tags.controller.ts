import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagType } from 'src/app/shared/enums/tag-type.enum';
import { TagQueryDto } from './dto/tag-query.dto';

@Controller('v1/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  findAll(@Query() query: TagQueryDto) {
    return this.tagsService.findAll(query);
  }

  @Get('active')
  findActiveTags(@Query('type') type?: TagType) {
    return this.tagsService.findActiveTags(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  removeBulk(@Query('type') type?: TagType) {
    return this.tagsService.removeBulk(type);
  }
} 