import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { TagsModule } from './modules/tags/tags.module';
import { SystemModule } from './modules/system/system.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { EmailModule } from './modules/email/email.module';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(configService.get<string>('REDIS_LINK')),
              namespace: 'read-comics-s3',
            }),
          ],
        };
      },
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_LINK'),
        },
      }),
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
    AuthModule,
    FavoritesModule,
    TagsModule,
    SystemModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 增加到 100 以免正常翻页被拦截
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
