import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Chapter } from './chapter.entity';
import { ReadingProgress } from './reading-progress.entity';
import { UserPreferences } from './user-preferences.entity';
import { ComicFormat, ComicStatus } from '@read-comics/types';

@Entity('comics')
export class Comic {
  @ApiProperty({
    description: '漫画唯一标识符',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '漫画标题', example: '进击的巨人' })
  @Column()
  title: string;

  @ApiProperty({ description: '作者', example: '谏山创', required: false })
  @Column({ nullable: true })
  author?: string;

  @ApiProperty({
    description: '漫画简介',
    example: '人类与巨人的生存之战',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: '文件路径', example: '/comics/attack-on-titan' })
  @Column()
  filePath: string;

  @ApiProperty({ description: '文件大小(字节)', example: 524288000 })
  @Column()
  fileSize: number;

  @ApiProperty({ description: '文件格式', enum: ComicFormat, example: 'cbz' })
  @Column()
  fileFormat: ComicFormat;

  @ApiProperty({
    description: '文件哈希值(MD5)',
    example: 'd41d8cd98f00b204e9800998ecf8427e',
    required: false,
  })
  @Column({ nullable: true })
  hash?: string;

  @ApiProperty({ description: '总页数', example: 139 })
  @Column()
  totalPages: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '最后阅读时间', required: false })
  @Column({ nullable: true })
  lastReadAt?: Date;

  @ApiProperty({
    description: '标签',
    example: ['热血', '战斗', '奇幻'],
    required: false,
    type: [String],
  })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({
    description: '评分(1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  rating?: number;

  @ApiProperty({
    description: '阅读次数',
    example: 100,
    required: false,
  })
  @Column({ type: 'int', default: 0 })
  readCount: number;

  @ApiProperty({
    description: '阅读状态',
    enum: ComicStatus,
    example: 'reading',
  })
  @Column()
  status: ComicStatus;

  @ApiProperty({ description: '章节列表', type: () => Chapter, isArray: true })
  @OneToMany(() => Chapter, (chapter) => chapter.comic)
  chapters: Chapter[];

  @ApiProperty({
    description: '阅读进度记录',
    type: () => ReadingProgress,
    isArray: true,
  })
  @OneToMany(() => ReadingProgress, (progress) => progress.comic)
  readingProgress: ReadingProgress[];

  @ApiProperty({ description: '用户偏好设置', type: () => UserPreferences })
  @OneToOne(() => UserPreferences, (preferences) => preferences.comic)
  preferences: UserPreferences;
}
