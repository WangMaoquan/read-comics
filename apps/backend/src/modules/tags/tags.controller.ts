import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签（管理员及以上）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Get(':id/comics')
  @ApiOperation({ summary: '获取标签下的漫画' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getComicsByTag(@Param('id') id: string) {
    return this.tagsService.getComicsByTag(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新标签（管理员及以上）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签（管理员及以上）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Post('comics/:comicId/tags/:tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '为漫画添加标签（管理员及以上）' })
  @ApiResponse({ status: 200, description: '添加成功' })
  addTagToComic(
    @Param('comicId') comicId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.addTagToComic(comicId, tagId);
  }

  @Delete('comics/:comicId/tags/:tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '从漫画移除标签（管理员及以上）' })
  @ApiResponse({ status: 200, description: '移除成功' })
  removeTagFromComic(
    @Param('comicId') comicId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.removeTagFromComic(comicId, tagId);
  }
}
