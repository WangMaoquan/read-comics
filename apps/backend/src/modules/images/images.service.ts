import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { extname } from 'path';
import { createHash } from 'crypto';
import * as sharp from 'sharp';
import pLimit from 'p-limit';
import { S3Service } from '../s3/s3.service';
import { ZipUtilsService } from '@common/utils/zip-utils.service';

@Injectable()
export class ImagesService {
  constructor(
    private configService: ConfigService,
    private zipUtilsService: ZipUtilsService,
    private s3Service: S3Service,
  ) {}

  /**
   * 获取图片配置
   */
  private getImageConfig() {
    return {
      maxWidth: parseInt(
        this.configService.get<string>('IMAGE_MAX_WIDTH', '1600'),
      ),
      quality: parseInt(this.configService.get<string>('IMAGE_QUALITY', '80')),
      format: this.configService.get<string>('IMAGE_FORMAT', 'webp'),
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(filePath: string, options?: any): string {
    const hash = createHash('md5');
    hash.update(filePath);

    if (options) {
      hash.update(JSON.stringify(options));
    }

    return hash.digest('hex');
  }

  /**
   * 生成漫画唯一的 Hash (基于路径)
   */
  private getComicHash(comicPath: string): string {
    const hash = createHash('md5');
    hash.update(comicPath);
    return hash.digest('hex');
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(
    imageBuffer: Buffer,
    width: number = 200,
    height: number = 300,
    quality: number = 80,
  ): Promise<Buffer> {
    try {
      const sharpInstance = sharp(imageBuffer);

      // 自动调整宽高比
      const metadata = await sharpInstance.metadata();
      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;

        if (width / height > aspectRatio) {
          width = Math.floor(height * aspectRatio);
        } else {
          height = Math.floor(width / aspectRatio);
        }
      }

      return await sharpInstance
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new InternalServerErrorException(
        `Failed to generate thumbnail: ${error.message}`,
      );
    }
  }

  /**
   * 生成并缓存缩略图 (返回 S3 Key)
   */
  async generateAndCacheThumbnail(
    comicPath: string,
    imagePath: string,
    width: number = 200,
    height: number = 300,
  ): Promise<string> {
    const comicHash = this.getComicHash(comicPath);
    const optionsHash = this.generateCacheKey(imagePath, {
      width,
      height,
      format: 'jpeg',
    });

    // 使用层级结构: cache/comics/{comicHash}/thumbnails/{optionsHash}.jpg
    const s3Key = `cache/comics/${comicHash}/thumbnails/${optionsHash}.jpg`;

    // 检查 S3 是否存在
    const exists = await this.s3Service.hasFile(s3Key);
    if (exists) {
      return s3Key;
    }

    // 从漫画文件中提取图片
    const imageBuffer = await this.extractImageFromComic(comicPath, imagePath);

    // 生成缩略图
    const thumbnail = await this.generateThumbnail(imageBuffer, width, height);

    // 上传到 S3
    await this.s3Service.uploadFile(s3Key, thumbnail, 'image/jpeg');

    return s3Key;
  }

  /**
   * 优化图片 (调整大小 + 转换为 WebP)
   */
  /**
   * 优化图片 (调整大小 + 转换为 WebP)
   */
  async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    const { maxWidth, quality, format } = this.getImageConfig();

    let pipeline = sharp(imageBuffer);

    // Resize if needed
    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    // Convert format
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality });
    }

    return await pipeline.toBuffer();
  }

  /**
   * 获取原图 S3 Key
   */
  private getOriginalS3Key(comicPath: string, imagePath: string): string {
    const comicHash = this.getComicHash(comicPath);
    const imageHash = this.generateCacheKey(imagePath);
    const ext = extname(imagePath).toLowerCase().replace('.', '') || 'jpg';
    return `originals/comics/${comicHash}/pages/${imageHash}.${ext}`;
  }

  /**
   * 获取优化后的 S3 Key
   */
  private getOptimizedS3Key(comicPath: string, imagePath: string): string {
    const comicHash = this.getComicHash(comicPath);
    const imageHash = this.generateCacheKey(imagePath);
    const { format } = this.getImageConfig();
    return `cache/comics/${comicHash}/pages/${imageHash}.${format}`;
  }

  /**
   * 确保 S3 上存在优化后的图片 (View/Cache)
   * 返回优化后的 S3 Key
   */
  async prepareImageOnS3(
    comicPath: string,
    imagePath: string,
  ): Promise<string> {
    const optimizedKey = this.getOptimizedS3Key(comicPath, imagePath);

    // 1. 检查优化后的缓存是否存在
    if (await this.s3Service.hasFile(optimizedKey)) {
      return optimizedKey;
    }

    const { format } = this.getImageConfig();

    // 2. 尝试从 S3 原图生成优化图 (如果已经归档)
    const originalKey = this.getOriginalS3Key(comicPath, imagePath);
    if (await this.s3Service.hasFile(originalKey)) {
      const originalStream = await this.s3Service.getFileStream(originalKey);
      const chunks: Buffer[] = [];
      for await (const chunk of originalStream) {
        chunks.push(chunk as Buffer);
      }
      const originalBuffer = Buffer.concat(chunks);

      const optimizedBuffer = await this.optimizeImage(originalBuffer);

      await this.s3Service.uploadFile(
        optimizedKey,
        optimizedBuffer,
        `image/${format}`,
      );
      return optimizedKey;
    }

    // 3. 从本地文件生成
    try {
      const imageBuffer = await this.extractImageFromComic(
        comicPath,
        imagePath,
      );
      const optimizedBuffer = await this.optimizeImage(imageBuffer);

      await this.s3Service.uploadFile(
        optimizedKey,
        optimizedBuffer,
        `image/${format}`,
      );
      return optimizedKey;
    } catch (e) {
      console.error(
        `Failed to prepare image ${imagePath} from local: ${e.message}`,
      );
      throw e;
    }
  }

  /**
   * 获取图片下载用的 S3 Key (返回原图 Key)
   */
  async getS3KeyForImage(
    comicPath: string,
    imagePath: string,
  ): Promise<string> {
    // 下载时优先使用原图
    const originalKey = this.getOriginalS3Key(comicPath, imagePath);

    // 如果原图存在，返回原图 Key
    if (await this.s3Service.hasFile(originalKey)) {
      return originalKey;
    }

    // 如果原图不存在 (未归档)，且本地文件也不存在 (意外情况)，尝试返回优化图?
    // 或者我们假设下载总是基于“如果有归档，一定是原图”。
    // 这里简单返回原图 Key, 上层调用者会处理 404
    return originalKey;
  }

  /**
   * 获取图片流
   */
  async getImageStream(key: string): Promise<any> {
    return this.s3Service.getFileStream(key);
  }

  /**
   * 归档漫画到 S3 (上传原图)
   */
  /**
   * 归档漫画到 S3 (上传原图)
   */
  async archiveComicToS3(comicPath: string, images: string[]): Promise<void> {
    console.log(
      `Archiving comic (originals): ${comicPath}, total images: ${images.length}`,
    );

    // Limit concurrency to 10
    const limit = pLimit(10);
    let processed = 0;

    const promises = images.map((imagePath) =>
      limit(async () => {
        const originalKey = this.getOriginalS3Key(comicPath, imagePath);

        // 如果原图已存在，跳过
        if (await this.s3Service.hasFile(originalKey)) {
          processed++;
          return;
        }

        try {
          // 提取原图 (不优化)
          const imageBuffer = await this.extractImageFromComic(
            comicPath,
            imagePath,
          );
          const ext =
            extname(imagePath).toLowerCase().replace('.', '') || 'jpg';

          let contentType = 'image/jpeg';
          if (ext === 'png') contentType = 'image/png';
          else if (ext === 'gif') contentType = 'image/gif';
          else if (ext === 'webp') contentType = 'image/webp';

          // 上传原图
          await this.s3Service.uploadFile(
            originalKey,
            imageBuffer,
            contentType,
          );
          processed++;

          if (processed % 50 === 0) {
            console.log(`Archived ${processed}/${images.length} images...`);
          }
        } catch (e) {
          console.error(
            `Failed to archive image ${imagePath} in ${comicPath}:`,
            e,
          );
          throw e;
        }
      }),
    );

    await Promise.all(promises);
    console.log(`Archive complete: ${processed} images processed.`);
  }

  /**
   * 从漫画文件中提取图片
   */
  async extractImageFromComic(
    comicPath: string,
    imagePath: string,
  ): Promise<Buffer> {
    try {
      // 检查文件是否存在
      await fs.access(comicPath);

      const ext = extname(comicPath).toLowerCase();
      if (ext === '.cbz' || ext === '.zip') {
        // 使用异步的 ZipUtilsService
        return await this.zipUtilsService.extractFileFromZip(
          comicPath,
          imagePath,
        );
      }

      throw new InternalServerErrorException(
        `Unsupported comic format: ${ext}. Only ZIP/CBZ formats are supported.`,
      );
    } catch (error) {
      console.error('Error extracting image from comic:', error);
      throw new InternalServerErrorException(
        `Failed to extract image: ${error.message}`,
      );
    }
  }
}
