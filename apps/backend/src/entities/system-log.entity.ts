import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

@Entity('system_logs')
@Index(['level'])
@Index(['module'])
@Index(['createdAt'])
export class SystemLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '日志级别',
    enum: ['info', 'warn', 'error', 'debug'],
  })
  @Column({ type: 'varchar', length: 10 })
  level: LogLevel;

  @ApiProperty({ description: '日志消息' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: '模块名称' })
  @Column({ type: 'varchar', length: 50 })
  module: string;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId?: string;

  @ApiProperty({ description: '用户名', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  username?: string;

  @ApiProperty({ description: 'IP地址', required: false })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string;

  @ApiProperty({ description: '元数据', required: false })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
