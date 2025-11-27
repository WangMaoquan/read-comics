import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ComicsModule } from '../comics/comics.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { ZipUtilsService } from '../../common/utils/zip-utils.service';

@Module({
  imports: [ComicsModule, ChaptersModule],
  controllers: [FilesController],
  providers: [FilesService, ZipUtilsService],
  exports: [FilesService],
})
export class FilesModule {}
