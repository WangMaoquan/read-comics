import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type TaskType = 'scan' | 'thumbnail' | 'backup' | 'cleanup' | 'import';
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

@Entity('tasks')
export class Task {
  @ApiProperty({ description: '任务ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '任务名称' })
  @Column()
  name: string;

  @ApiProperty({
    description: '任务类型',
    enum: ['scan', 'thumbnail', 'backup', 'cleanup', 'import'],
  })
  @Column()
  type: TaskType;

  @ApiProperty({
    description: '任务状态',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
  })
  @Column({ default: 'pending' })
  status: TaskStatus;

  @ApiProperty({ description: '进度(0-100)' })
  @Column({ type: 'int', default: 0 })
  progress: number;

  @ApiProperty({ description: '开始时间', required: false })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({ type: 'text', nullable: true })
  error?: string;

  @ApiProperty({ description: '任务参数', required: false })
  @Column({ type: 'json', nullable: true })
  params?: any;

  @ApiProperty({ description: '任务结果', required: false })
  @Column({ type: 'json', nullable: true })
  result?: any;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
