import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ZipUtilsService } from '../../common/utils/zip-utils.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, ZipUtilsService],
  exports: [ImagesService],
})
export class ImagesModule {}
