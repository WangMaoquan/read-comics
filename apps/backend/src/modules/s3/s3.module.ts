import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';

@Module({
  imports: [
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
    }),
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
