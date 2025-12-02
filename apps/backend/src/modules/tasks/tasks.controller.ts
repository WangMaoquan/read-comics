import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: '任务创建成功' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  @ApiResponse({ status: 200, description: '成功获取任务列表' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: '获取任务统计' })
  @ApiResponse({ status: 200, description: '成功获取统计' })
  getStats() {
    return this.tasksService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取任务详情' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '任务已取消' })
  cancel(@Param('id') id: string) {
    return this.tasksService.cancel(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: '重试任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '任务已重试' })
  retry(@Param('id') id: string) {
    return this.tasksService.retry(id);
  }

  @Delete('completed')
  @ApiOperation({ summary: '清除已完成任务' })
  @ApiResponse({ status: 200, description: '清除成功' })
  clearCompleted() {
    return this.tasksService.clearCompleted();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
