import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comic } from '../entities/comic.entity';
import { Chapter } from '../entities/chapter.entity';
import { ReadingProgress } from '../entities/reading-progress.entity';
import { UserPreferences } from '../entities/user-preferences.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(ReadingProgress)
    private readonly readingProgressRepository: Repository<ReadingProgress>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
  ) {}

  async initializeDatabase(): Promise<void> {
    await this.comicRepository.query(`
      CREATE TABLE IF NOT EXISTS comics (
        id UUID PRIMARY KEY,
        title VARCHAR NOT NULL,
        author VARCHAR,
        description TEXT,
        filePath VARCHAR NOT NULL,
        fileSize INT NOT NULL,
        fileFormat VARCHAR NOT NULL,
        totalPages INT NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        lastReadAt TIMESTAMP,
        tags TEXT[],
        rating INT,
        status VARCHAR NOT NULL
      );
    `);
    // 数据库初始化逻辑
    console.log('Database initialized successfully');
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.comicRepository.find({ take: 1 });
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
}
