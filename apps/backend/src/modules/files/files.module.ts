import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ComicsModule } from '../comics/comics.module';
import { ChaptersModule } from '../chapters/chapters.module';

@Module({
  imports: [ComicsModule, ChaptersModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
