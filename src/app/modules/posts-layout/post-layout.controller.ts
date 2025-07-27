import { Controller, Get, Body, Param, Put } from '@nestjs/common';
import { PostLayoutService } from './post-layout.service';
import { UpdatePostLayoutDto } from './dto/update-post-layout.dto';

@Controller('v1/post-layout')
export class PostLayoutController {
  constructor(private readonly postLayoutService: PostLayoutService) {}
  @Get()
  findAll() {
    return this.postLayoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postLayoutService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostLayoutDto: UpdatePostLayoutDto,
  ) {
    return this.postLayoutService.update(id, updatePostLayoutDto);
  }
}
