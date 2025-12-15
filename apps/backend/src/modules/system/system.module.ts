import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { Comic } from '@entities/comic.entity';
import { Chapter } from '@entities/chapter.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { UserPreferences } from '@entities/user-preferences.entity';
import { Favorite } from '@entities/favorite.entity';
import { Tag } from '@entities/tag.entity';
import { Backup } from '@entities/backup.entity';
import { Task } from '@entities/task.entity';
import { SystemLog } from '@entities/system-log.entity';
import { S3Module } from '@modules/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comic,
      Chapter,
      ReadingProgress,
      UserPreferences,
      Favorite,
      Tag,
      Backup,
      Task,
      SystemLog,
    ]),
    S3Module,
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
