import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Comic } from './comic.entity';

@Entity('chapters')
export class Chapter {
  @ApiProperty({
    description: '章节唯一标识符',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '章节标题', example: '第1话：致两千年后的你' })
  @Column()
  title: string;

  @ApiProperty({ description: '页码', example: 1 })
  @Column()
  pageNumber: number;

  @ApiProperty({ description: '图片路径', example: '/images/chapter-01.jpg' })
  @Column()
  imagePath: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '所属漫画', type: () => Comic })
  @ManyToOne(() => Comic, (comic) => comic.chapters)
  comic: Comic;
}
