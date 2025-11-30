import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoriteStatus } from '../../entities/favorite.entity';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: '添加收藏' })
  @ApiResponse({ status: 201, description: '收藏成功' })
  create(@Request() req, @Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(req.user.sub, createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: '获取我的收藏列表' })
  @ApiQuery({ name: 'status', required: false, enum: FavoriteStatus })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Request() req, @Query('status') status?: FavoriteStatus) {
    return this.favoritesService.findAllByUser(req.user.sub, status);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取收藏统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@Request() req) {
    return this.favoritesService.getStats(req.user.sub);
  }

  @Get(':comicId')
  @ApiOperation({ summary: '检查是否已收藏' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Request() req, @Param('comicId') comicId: string) {
    return this.favoritesService.findOne(req.user.sub, comicId);
  }

  @Patch(':comicId')
  @ApiOperation({ summary: '更新收藏状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Request() req,
    @Param('comicId') comicId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(
      req.user.sub,
      comicId,
      updateFavoriteDto,
    );
  }

  @Delete(':comicId')
  @ApiOperation({ summary: '取消收藏' })
  @ApiResponse({ status: 200, description: '取消成功' })
  remove(@Request() req, @Param('comicId') comicId: string) {
    return this.favoritesService.remove(req.user.sub, comicId);
  }
}
