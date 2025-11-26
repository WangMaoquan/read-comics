import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Comic } from './comic.entity';
import { ReadingMode, Theme } from '@read-comics/types';

@Entity('user_preferences')
export class UserPreferences {
  @ApiProperty({ description: '偏好设置唯一标识符' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '阅读模式',
    enum: ReadingMode,
    example: 'single',
  })
  @Column()
  readingMode: ReadingMode;

  @ApiProperty({ description: '主题', enum: Theme, example: 'light' })
  @Column()
  theme: Theme;

  @ApiProperty({ description: '语言', example: 'zh-CN' })
  @Column()
  language: string;

  @ApiProperty({ description: '自动保存进度', example: true })
  @Column()
  autoSaveProgress: boolean;

  @ApiProperty({ description: '页面过渡动画', example: true })
  @Column()
  pageTransition: boolean;

  @ApiProperty({ description: '显示页码', example: true })
  @Column()
  showPageNumbers: boolean;

  @ApiProperty({ description: '双页模式', example: false })
  @Column()
  doublePageMode: boolean;

  @ApiProperty({ description: '适应屏幕', example: true })
  @Column()
  fitToScreen: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '关联漫画', type: () => Comic })
  @OneToOne(() => Comic, (comic) => comic.preferences)
  comic: Comic;
}
