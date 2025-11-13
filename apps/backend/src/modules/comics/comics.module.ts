import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { Comic } from '../../entities/comic.entity';
import { Chapter } from '../../entities/chapter.entity';
import { ReadingProgress } from '../../entities/reading-progress.entity';
import { UserPreferences } from '../../entities/user-preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comic,
      Chapter,
      ReadingProgress,
      UserPreferences,
    ]),
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
  exports: [ComicsService],
})
export class ComicsModule {}
