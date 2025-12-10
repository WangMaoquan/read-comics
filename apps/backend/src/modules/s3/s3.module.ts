import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(), // 如果使用缓存
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
