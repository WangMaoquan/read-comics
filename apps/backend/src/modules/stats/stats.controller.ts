import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取总览统计' })
  @ApiResponse({ status: 200, description: '成功获取统计数据' })
  getOverview() {
    return this.statsService.getOverview();
  }

  @Get('comics-trend')
  @ApiOperation({ summary: '获取漫画趋势' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: ['day', 'week', 'month'],
  })
  @ApiResponse({ status: 200, description: '成功获取趋势数据' })
  getComicsTrend(@Query() query: GetStatsQueryDto) {
    return this.statsService.getComicsTrend(query);
  }

  @Get('top-comics')
  @ApiOperation({ summary: '获取热门漫画' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功获取热门漫画' })
  getTopComics(@Query('limit') limit?: number) {
    return this.statsService.getTopComics(
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('storage')
  @ApiOperation({ summary: '获取存储统计' })
  @ApiResponse({ status: 200, description: '成功获取存储统计' })
  getStorageStats() {
    return this.statsService.getStorageStats();
  }

  @Get('user-activity')
  @ApiOperation({ summary: '获取用户活跃度' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: '成功获取活跃度数据' })
  getUserActivity(@Query() query: GetStatsQueryDto) {
    return this.statsService.getUserActivity(query);
  }
}
