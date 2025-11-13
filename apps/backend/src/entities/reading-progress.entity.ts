import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Comic } from './comic.entity';

@Entity('reading_progress')
export class ReadingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comicId: string;

  @Column()
  chapterId: string;

  @Column()
  currentPage: number;

  @Column()
  totalPages: number;

  @Column()
  progress: number; // 0-100

  @CreateDateColumn()
  lastReadAt: Date;

  @ManyToOne(() => Comic, (comic) => comic.readingProgress)
  comic: Comic;
}
