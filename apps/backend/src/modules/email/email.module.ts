import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(configService.get<string>('REDIS_LINK')),
              namespace: 'read-comics-email',
              ttl: 5 * 60,
            }),
          ],
        };
      },
    }),
  ],
})
export class EmailModule {}
