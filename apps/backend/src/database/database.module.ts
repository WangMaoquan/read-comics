import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { Comic } from '../entities/comic.entity';
import { Chapter } from '../entities/chapter.entity';
import { ReadingProgress } from '../entities/reading-progress.entity';
import { UserPreferences } from '../entities/user-preferences.entity';
import { User } from '../entities/user.entity';
import { Favorite } from '../entities/favorite.entity';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Comic,
          Chapter,
          ReadingProgress,
          UserPreferences,
          User,
          Favorite,
          Tag,
        ],
        synchronize: true, // 开发环境使用，生产环境需要关闭
        logging: true,
        extra: {
          connectionLimit: 10,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
