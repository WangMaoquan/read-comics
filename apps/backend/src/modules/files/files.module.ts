import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ComicsModule } from '../comics/comics.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { ZipUtilsService } from '@common/utils/zip-utils.service';

@Module({
  imports: [
    ComicsModule,
    ChaptersModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>(
            'COMICS_PATH',
            './user-upload',
          ),
          filename: (req, file, cb) => {
            // 使用唯一文件名,防止同名不同内容的文件相互覆盖
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const nameWithoutExt = file.originalname.slice(0, -ext.length);
            cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, ZipUtilsService],
  exports: [FilesService],
})
export class FilesModule {}
