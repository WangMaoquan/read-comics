import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemLogsService } from './system-logs.service';
import { QuerySystemLogsDto } from './dto/query-system-logs.dto';

@ApiTags('system-logs')
@Controller('logs')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Get()
  @ApiOperation({ summary: '获取日志列表' })
  @ApiResponse({ status: 200, description: '成功获取日志' })
  findAll(@Query() query: QuerySystemLogsDto) {
    return this.systemLogsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取日志统计' })
  @ApiResponse({ status: 200, description: '成功获取统计' })
  getStats() {
    return this.systemLogsService.getStats();
  }

  @Delete()
  @ApiOperation({ summary: '清空所有日志' })
  @ApiResponse({ status: 200, description: '清空成功' })
  clearAll() {
    return this.systemLogsService.clearAll();
  }
}
