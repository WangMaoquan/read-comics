import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  _Object,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// https://docs.nestjs.com/techniques/caching#installation

@Injectable()
export class S3Service implements OnModuleInit {
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

  async onModuleInit() {
    await this.initBucket();
  }

  async initBucket() {
    if (this.isCreateBucket) {
      console.log(`${this.bucket} already exists`);
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
      // Ignore if bucket already exists error or handle accordingly
      // For now, logging as user did
      console.log(`Bucket init check: ${error.message}`);
      // Usually S3 services don't fail just because they can't create a bucket (might already exist owned by someone else or permission issue)
      // But assuming the user wants to ensure it exists.
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
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error(`S3 Upload Error for key ${key}:`, error);
      throw error;
    }
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

  /**
   * 获取文件流
   */
  async getFileStream(key: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return response.Body;
  }

  /**
   * 删除单个文件
   * @param key S3对象的key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`S3 Delete Error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 批量删除文件
   * @param keys S3对象key的数组
   */
  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`S3 Bulk Delete Error for keys ${keys.join(', ')}:`, error);
      throw error;
    }
  }

  /**
   * 列出桶中的所有文件
   */
  async listAllFiles(): Promise<_Object[]> {
    const allObjects: _Object[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucket,
          ContinuationToken: continuationToken,
        });

        const response = await this.s3Client.send(command);

        if (response.Contents) {
          allObjects.push(...response.Contents);
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return allObjects;
    } catch (error) {
      console.error('Error listing S3 objects:', error);
      throw error;
    }
  }

  /**
   * 删除桶中的所有文件
   * @returns 删除的文件数量
   */
  async deleteAllFiles(): Promise<number> {
    try {
      // 获取所有文件
      const allObjects = await this.listAllFiles();

      if (allObjects.length === 0) {
        console.log('No files to delete in S3 bucket');
        return 0;
      }

      // S3 DeleteObjects 命令最多支持一次删除 1000 个对象
      const batchSize = 1000;
      let deletedCount = 0;

      for (let i = 0; i < allObjects.length; i += batchSize) {
        const batch = allObjects.slice(i, i + batchSize);

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: batch.map((obj) => ({ Key: obj.Key })),
            Quiet: true, // 不返回成功删除的对象列表
          },
        });

        const response = await this.s3Client.send(deleteCommand);

        // 计算成功删除的数量
        const batchDeletedCount = batch.length - (response.Errors?.length || 0);
        deletedCount += batchDeletedCount;

        if (response.Errors && response.Errors.length > 0) {
          console.error(
            `Failed to delete ${response.Errors.length} objects:`,
            response.Errors,
          );
        }
      }

      console.log(`Deleted ${deletedCount} files from S3 bucket`);
      return deletedCount;
    } catch (error) {
      console.error('Error deleting all S3 files:', error);
      throw error;
    }
  }
}
