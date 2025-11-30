import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ComicsModule } from './modules/comics/comics.module';
import { FilesModule } from './modules/files/files.module';
import { ImagesModule } from './modules/images/images.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { BackupsModule } from './modules/backups/backups.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

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
    ChaptersModule,
    UsersModule,
    StatsModule,
    SystemLogsModule,
    BackupsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
