import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Chapter } from './chapter.entity';
import { ReadingProgress } from './reading-progress.entity';
import { UserPreferences } from './user-preferences.entity';
import { ComicFormat, ComicStatus } from '@read-comics/types';

@Entity('comics')
export class Comic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column()
  fileFormat: ComicFormat;

  @Column()
  totalPages: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastReadAt?: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column()
  status: ComicStatus;

  @OneToMany(() => Chapter, (chapter) => chapter.comic)
  chapters: Chapter[];

  @OneToMany(() => ReadingProgress, (progress) => progress.comic)
  readingProgress: ReadingProgress[];

  @OneToOne(() => UserPreferences, (preferences) => preferences.comic)
  preferences: UserPreferences;
}
