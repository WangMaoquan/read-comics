import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Comic } from './comic.entity';

@Entity('reading_progress')
@Unique(['comicId', 'chapterId'])
export class ReadingProgress {
  @ApiProperty({ description: '进度记录唯一标识符' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '漫画ID' })
  @Column()
  comicId: string;

  @ApiProperty({ description: '章节ID' })
  @Column()
  chapterId: string;

  @ApiProperty({ description: '当前页码', example: 15 })
  @Column()
  currentPage: number;

  @ApiProperty({ description: '总页数', example: 139 })
  @Column()
  totalPages: number;

  @ApiProperty({ description: '章节是否读完', example: false })
  @Column({ type: Boolean, default: false })
  isReadComplete: boolean;

  @ApiProperty({
    description: '阅读进度(0-100)',
    example: 45,
    minimum: 0,
    maximum: 100,
  })
  @Column()
  progress: number; // 0-100

  @ApiProperty({ description: '最后阅读时间' })
  @CreateDateColumn()
  lastReadAt: Date;

  @ApiProperty({ description: '所属漫画', type: () => Comic })
  @ManyToOne(() => Comic, (comic) => comic.readingProgress)
  comic: Comic;
}
