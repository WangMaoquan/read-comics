import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { Chapter } from '@entities/chapter.entity';

@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  @ApiOperation({ summary: '获取章节列表' })
  @ApiQuery({ name: 'comicId', required: false, description: '漫画ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取章节列表',
    type: [Chapter],
  })
  findAll(@Query('comicId') comicId?: string) {
    return this.chaptersService.findAll(comicId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({ status: 200, description: '成功获取章节详情', type: Chapter })
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }
}
