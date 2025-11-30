import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import type { ComicFilter } from '@read-comics/types';

@ApiTags('comics')
@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Post('/')
  @ApiOperation({ summary: '创建漫画' })
  @ApiBody({ type: CreateComicDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  @UsePipes(new ValidationPipe())
  create(@Body() createComicDto: CreateComicDto) {
    console.log(createComicDto);
    return this.comicsService.create(createComicDto);
  }

  @Get('/')
  @ApiOperation({ summary: '获取漫画列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() filter?: ComicFilter) {
    return this.comicsService.findAll(filter);
  }

  @Get('count')
  @ApiOperation({ summary: '获取漫画总数' })
  @ApiResponse({ status: 200, description: '获取成功' })
  count() {
    return this.comicsService.count();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取漫画详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '漫画不存在' })
  findOne(@Param('id') id: string) {
    return this.comicsService.findOne(id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: '更新阅读进度' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.comicsService.updateProgress(id, updateProgressDto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: '获取阅读进度' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getProgress(@Param('id') id: string) {
    return this.comicsService.getProgress(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新漫画' })
  @ApiBody({ type: UpdateComicDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto) {
    return this.comicsService.update(id, updateComicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除漫画' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.comicsService.remove(id);
  }
}
