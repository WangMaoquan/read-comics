import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { Comic } from '../../entities/comic.entity';
import { ReadingProgress } from '../../entities/reading-progress.entity';
import { ChaptersModule } from '../chapters/chapters.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comic, ReadingProgress]), ChaptersModule],
  controllers: [ComicsController],
  providers: [ComicsService],
  exports: [ComicsService],
})
export class ComicsModule {}
