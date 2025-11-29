import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BackupsService } from './backups.service';
import { CreateBackupDto } from './dto/create-backup.dto';

@ApiTags('backups')
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Post()
  @ApiOperation({ summary: '创建备份' })
  @ApiBody({ type: CreateBackupDto })
  @ApiResponse({ status: 201, description: '备份创建成功' })
  create(@Body() createBackupDto: CreateBackupDto) {
    return this.backupsService.create(createBackupDto);
  }

  @Get()
  @ApiOperation({ summary: '获取备份列表' })
  @ApiResponse({ status: 200, description: '成功获取备份列表' })
  findAll() {
    return this.backupsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: '获取备份统计' })
  @ApiResponse({ status: 200, description: '成功获取统计' })
  getStats() {
    return this.backupsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取备份详情' })
  @ApiParam({ name: 'id', description: '备份ID' })
  @ApiResponse({ status: 200, description: '成功获取备份详情' })
  findOne(@Param('id') id: string) {
    return this.backupsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除备份' })
  @ApiParam({ name: 'id', description: '备份ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.backupsService.remove(id);
  }
}
