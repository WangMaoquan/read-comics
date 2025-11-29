import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('backups')
export class Backup {
  @ApiProperty({ description: '备份ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '备份名称' })
  @Column()
  name: string;

  @ApiProperty({ description: '备份类型', enum: ['full', 'incremental'] })
  @Column()
  type: 'full' | 'incremental';

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({ type: 'bigint', default: 0 })
  size: number;

  @ApiProperty({
    description: '备份状态',
    enum: ['completed', 'failed', 'in_progress'],
  })
  @Column({ default: 'in_progress' })
  status: 'completed' | 'failed' | 'in_progress';

  @ApiProperty({ description: '文件路径' })
  @Column()
  filePath: string;

  @ApiProperty({ description: '备份描述', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
