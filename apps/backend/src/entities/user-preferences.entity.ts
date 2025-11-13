import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Comic } from './comic.entity';
import { ReadingMode, Theme } from '@read-comics/types';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  readingMode: ReadingMode;

  @Column()
  theme: Theme;

  @Column()
  language: string;

  @Column()
  autoSaveProgress: boolean;

  @Column()
  pageTransition: boolean;

  @Column()
  showPageNumbers: boolean;

  @Column()
  doublePageMode: boolean;

  @Column()
  fitToScreen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Comic, (comic) => comic.preferences)
  comic: Comic;
}
