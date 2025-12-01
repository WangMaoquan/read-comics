import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Comic } from './comic.entity';

@Entity('tags')
export class Tag {
  @ApiProperty({ description: '标签唯一标识符' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '标签名称', example: '热血' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: '标签颜色', example: '#3b82f6' })
  @Column({ default: '#3b82f6' })
  color: string;

  @ApiProperty({ description: '使用次数', example: 10 })
  @Column({ default: 0 })
  count: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Comic, (comic) => comic.tags)
  comics: Comic[];
}
