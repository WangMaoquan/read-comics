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
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import type { ComicFilter } from '@read-comics/types';

@ApiTags('comics')
@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建漫画（管理员及以上）' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新阅读进度（需要登录）' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.comicsService.updateProgress(id, updateProgressDto);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取阅读进度（需要登录）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getProgress(@Param('id') id: string) {
    return this.comicsService.getProgress(id);
  }

  @Get(':id/progress/chapter/:chapterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取指定章节阅读进度（需要登录）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getChapterProgress(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.comicsService.getChapterProgress(id, chapterId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新漫画（管理员及以上）' })
  @ApiBody({ type: UpdateComicDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto) {
    return this.comicsService.update(id, updateComicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除漫画（管理员及以上）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.comicsService.remove(id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换收藏状态' })
  @ApiResponse({ status: 200, description: '操作成功' })
  toggleFavorite(@Param('id') id: string, @Req() req) {
    return this.comicsService.toggleFavorite(id, req.user.sub);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '归档漫画到云端（上传所有图片并删除本地文件）' })
  @ApiResponse({ status: 200, description: '归档任务开始/完成' })
  async archive(@Param('id') id: string) {
    await this.comicsService.archive(id);
    return { success: true, message: 'Comic archived successfully' };
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载漫画（支持按需下载章节）' })
  @ApiQuery({
    name: 'chapterIds',
    required: false,
    type: String,
    description: '逗号分隔的章节ID',
  })
  async download(
    @Param('id') id: string,
    @Query('chapterIds') chapterIds?: string,
  ) {
    const ids = chapterIds ? chapterIds.split(',') : undefined;
    return this.comicsService.download(id, ids);
  }

  @Post('merge-duplicates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '合并重复漫画' })
  async mergeDuplicates(
    @Body('keepId') keepId: string,
    @Body('deleteIds') deleteIds: string[],
  ) {
    await this.comicsService.mergeDuplicates(keepId, deleteIds);
    return { success: true };
  }
}
