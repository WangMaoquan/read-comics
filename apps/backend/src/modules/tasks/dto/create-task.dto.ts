import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '任务类型',
    enum: ['scan', 'thumbnail', 'backup', 'cleanup', 'import'],
  })
  @IsIn(['scan', 'thumbnail', 'backup', 'cleanup', 'import'])
  type: TaskType;

  @ApiProperty({ description: '任务参数', required: false })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
