import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SystemLogsService } from './system-logs.service';
import { QuerySystemLogsDto } from './dto/query-system-logs.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('system-logs')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth()
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
