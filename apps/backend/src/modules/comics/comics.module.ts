import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { Comic } from '@entities/comic.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { Tag } from '@entities/tag.entity';
import { ChaptersModule } from '../chapters/chapters.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { ImagesModule } from '../images/images.module';
import { FilesModule } from '../files/files.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comic, ReadingProgress, Tag]),
    ChaptersModule,
    FavoritesModule,
    ImagesModule,
    forwardRef(() => FilesModule),
    forwardRef(() => TasksModule),
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
  exports: [ComicsService],
})
export class ComicsModule {}
