import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { S3Service } from '@modules/s3/s3.service';
import { Comic } from '@entities/comic.entity';
import { Chapter } from '@entities/chapter.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { UserPreferences } from '@entities/user-preferences.entity';
import { Favorite } from '@entities/favorite.entity';
import { Tag } from '@entities/tag.entity';
import { Backup } from '@entities/backup.entity';
import { Task } from '@entities/task.entity';
import { SystemLog } from '@entities/system-log.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ResetSystemResult {
  success: boolean;
  deletedCounts: {
    database: {
      readingProgress: number;
      chapters: number;
      userPreferences: number;
      favorites: number;
      comicTags: number;
      comics: number;
      tags: number;
      backups: number;
      tasks: number;
      systemLogs: number;
    };
    zipFiles: number;
    s3Files: number;
  };
  errors?: string[];
}

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(ReadingProgress)
    private readonly readingProgressRepository: Repository<ReadingProgress>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Backup)
    private readonly backupRepository: Repository<Backup>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 重置系统 - 清空所有数据(保留用户表)
   */
  async resetSystem(): Promise<ResetSystemResult> {
    this.logger.warn('Starting system reset operation...');

    const result: ResetSystemResult = {
      success: true,
      deletedCounts: {
        database: {
          readingProgress: 0,
          chapters: 0,
          userPreferences: 0,
          favorites: 0,
          comicTags: 0,
          comics: 0,
          tags: 0,
          backups: 0,
          tasks: 0,
          systemLogs: 0,
        },
        zipFiles: 0,
        s3Files: 0,
      },
      errors: [] as string[],
    };

    try {
      // 1. 清空数据库表
      this.logger.log('Clearing database tables...');
      const dbCounts = await this.clearDatabaseTables();
      result.deletedCounts.database = dbCounts;

      // 2. 删除 user-upload 目录下的所有 ZIP 文件
      this.logger.log('Deleting ZIP files from user-upload...');
      result.deletedCounts.zipFiles = await this.deleteUserUploadFiles();

      // 3. 清空 Redis 缓存
      this.logger.log('Clearing Redis cache...');
      await this.clearRedisCache();

      // 4. 删除 S3 上的所有文件
      this.logger.log('Deleting S3 files...');
      result.deletedCounts.s3Files = await this.deleteS3Files();

      this.logger.warn('System reset completed successfully');
    } catch (error) {
      this.logger.error('System reset failed', error.stack);
      result.success = false;
      if (result.errors) {
        result.errors.push(error.message);
      }
    }

    return result;
  }

  /**
   * 清空数据库表(保留 users 表)
   * 按照外键依赖顺序删除
   */
  private async clearDatabaseTables() {
    const counts = {
      readingProgress: 0,
      chapters: 0,
      userPreferences: 0,
      favorites: 0,
      comicTags: 0,
      comics: 0,
      tags: 0,
      backups: 0,
      tasks: 0,
      systemLogs: 0,
    };

    try {
      // 1. 删除 reading_progress (引用 comics)
      const readingProgressResult = await this.readingProgressRepository.delete(
        {},
      );
      counts.readingProgress = readingProgressResult.affected || 0;
      this.logger.log(
        `Deleted ${counts.readingProgress} reading progress records`,
      );

      // 2. 删除 chapters (引用 comics)
      const chaptersResult = await this.chapterRepository.delete({});
      counts.chapters = chaptersResult.affected || 0;
      this.logger.log(`Deleted ${counts.chapters} chapters`);

      // 3. 删除 user_preferences (引用 comics)
      const preferencesResult = await this.userPreferencesRepository.delete({});
      counts.userPreferences = preferencesResult.affected || 0;
      this.logger.log(`Deleted ${counts.userPreferences} user preferences`);

      // 4. 删除 favorites (引用 users 和 comics)
      const favoritesResult = await this.favoriteRepository.delete({});
      counts.favorites = favoritesResult.affected || 0;
      this.logger.log(`Deleted ${counts.favorites} favorites`);

      // 5. 删除 comic_tags 关联表 (引用 comics 和 tags)
      // 使用原生查询删除关联表
      const comicTagsResult = await this.dataSource.query(
        'DELETE FROM comic_tags',
      );
      counts.comicTags = comicTagsResult[1] || 0;
      this.logger.log(`Deleted ${counts.comicTags} comic-tag associations`);

      // 6. 删除 comics (父表)
      const comicsResult = await this.comicRepository.delete({});
      counts.comics = comicsResult.affected || 0;
      this.logger.log(`Deleted ${counts.comics} comics`);

      // 7. 删除 tags (独立表)
      const tagsResult = await this.tagRepository.delete({});
      counts.tags = tagsResult.affected || 0;
      this.logger.log(`Deleted ${counts.tags} tags`);

      // 8. 删除 backups (独立表)
      const backupsResult = await this.backupRepository.delete({});
      counts.backups = backupsResult.affected || 0;
      this.logger.log(`Deleted ${counts.backups} backups`);

      // 9. 删除 tasks (独立表)
      const tasksResult = await this.taskRepository.delete({});
      counts.tasks = tasksResult.affected || 0;
      this.logger.log(`Deleted ${counts.tasks} tasks`);

      // 10. 删除 system_logs (独立表)
      const logsResult = await this.systemLogRepository.delete({});
      counts.systemLogs = logsResult.affected || 0;
      this.logger.log(`Deleted ${counts.systemLogs} system logs`);
    } catch (error) {
      this.logger.error('Error clearing database tables', error.stack);
      throw error;
    }

    return counts;
  }

  /**
   * 删除 user-upload 目录下的所有 ZIP 文件
   */
  private async deleteUserUploadFiles(): Promise<number> {
    const userUploadDir = path.join(process.cwd(), 'user-upload');
    let deletedCount = 0;

    try {
      // 检查目录是否存在
      try {
        await fs.access(userUploadDir);
      } catch {
        this.logger.warn(
          `user-upload directory does not exist: ${userUploadDir}`,
        );
        return 0;
      }

      // 读取目录中的所有文件
      const files = await fs.readdir(userUploadDir);

      // 过滤出 .zip 文件
      const zipFiles = files.filter((file) =>
        file.toLowerCase().endsWith('.zip'),
      );

      // 删除每个 ZIP 文件
      for (const file of zipFiles) {
        const filePath = path.join(userUploadDir, file);
        try {
          await fs.unlink(filePath);
          deletedCount++;
          this.logger.log(`Deleted ZIP file: ${file}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${file}`, error.stack);
        }
      }

      this.logger.log(`Deleted ${deletedCount} ZIP files from user-upload`);
    } catch (error) {
      this.logger.error('Error deleting user-upload files', error.stack);
      throw error;
    }

    return deletedCount;
  }

  /**
   * 清空 Redis 缓存
   */
  private async clearRedisCache(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.log('Redis cache cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing Redis cache', error.stack);
      throw error;
    }
  }

  /**
   * 删除 S3 上的所有文件
   */
  private async deleteS3Files(): Promise<number> {
    try {
      const deletedCount = await this.s3Service.deleteAllFiles();
      this.logger.log(`Deleted ${deletedCount} files from S3`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error deleting S3 files', error.stack);
      throw error;
    }
  }
}
