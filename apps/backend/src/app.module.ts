import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ComicsModule } from './modules/comics/comics.module';
import { FilesModule } from './modules/files/files.module';
import { ImagesModule } from './modules/images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ComicsModule,
    FilesModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
