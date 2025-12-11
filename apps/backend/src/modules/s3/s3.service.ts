import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// https://docs.nestjs.com/techniques/caching#installation

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private isCreateBucket: boolean = false;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // 区域
    const region = this.configService.get('RUSTFS_REGION');
    const accessKeyId = this.configService.get('RUSTFS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('RUSTFS_SECRET_ACCESS_KEY');
    // 部署的 host
    const endpoint = this.configService.get('RUSTFS_ENDPOINT_URL');

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
    });
    this.bucket = this.configService.get('RUSTFS_BUCKET_PREFIX')!;
  }

  async ininBucket() {
    if (this.isCreateBucket) {
      console.log(`${this.bucket} has already exist`);
      return;
    }

    try {
      await this.s3Client.send(
        new CreateBucketCommand({
          Bucket: this.bucket,
        }),
      );
      this.isCreateBucket = true;
      console.log(`${this.bucket} init complete`);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 生成预签名URL
   * @param key S3对象的key
   * @param expiresIn 过期时间（秒），默认7天
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return url;
  }

  /**
   * 批量生成预签名URL
   */
  async getPresignedUrls(keys: string[]): Promise<Record<string, string>> {
    const urlPromises = keys.map(async (key) => {
      const url = await this.getPresignedUrl(key);
      return { key, url };
    });

    const results = await Promise.all(urlPromises);
    return results.reduce((acc, { key, url }) => {
      acc[key] = url;
      return acc;
    }, {});
  }

  /**
   * 带缓存的预签名URL生成
   */
  async getPresignedUrlWithCache(key: string): Promise<string> {
    const cacheKey = `s3:presigned:${key}`;

    // 先从缓存获取
    const cachedUrl = await this.cacheManager.get<string>(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    // 生成新URL
    const url = await this.getPresignedUrl(key);

    // 缓存6天（比7天短一点，确保不会过期）
    await this.cacheManager.set(cacheKey, url, 6 * 24 * 60 * 60 * 1000);

    return url;
  }
  /**
   * 上传文件
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType?: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  /**
   * 检查文件是否存在
   */
  async hasFile(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}
