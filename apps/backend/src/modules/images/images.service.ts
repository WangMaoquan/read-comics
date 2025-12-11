import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs, createReadStream } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import * as sharp from 'sharp';
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
   * 准备图片到 S3 (返回 S3 Key)
   */
  async prepareImageOnS3(
    comicPath: string,
    imagePath: string,
  ): Promise<string> {
    const comicHash = this.getComicHash(comicPath);
    const imageHash = this.generateCacheKey(imagePath); // 只 hash imagePath，不包含 comicPath，因为已经在目录里了
    const ext = extname(imagePath).toLowerCase().replace('.', '') || 'jpg';

    // 使用层级结构: cache/comics/{comicHash}/pages/{imageHash}.{ext}
    const s3Key = `cache/comics/${comicHash}/pages/${imageHash}.${ext}`;

    // 检查 S3 是否存在
    const exists = await this.s3Service.hasFile(s3Key);
    if (exists) {
      return s3Key;
    }

    // Extract
    const imageBuffer = await this.extractImageFromComic(comicPath, imagePath);

    // Determine content type
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';

    // Upload
    await this.s3Service.uploadFile(s3Key, imageBuffer, contentType);

    return s3Key;
  }

  /**
   * 获取图片的 S3 Key (用于下载等场景)
   */
  async getS3KeyForImage(
    comicPath: string,
    imagePath: string,
  ): Promise<string> {
    const comicHash = this.getComicHash(comicPath);
    const imageHash = this.generateCacheKey(imagePath);
    const ext = extname(imagePath).toLowerCase().replace('.', '') || 'jpg';
    return `cache/comics/${comicHash}/pages/${imageHash}.${ext}`;
  }

  /**
   * 获取图片流 (用于下载)
   */
  async getImageStream(key: string): Promise<any> {
    return this.s3Service.getFileStream(key);
  }

  /**
   * 归档漫画到 S3 (批量上传所有图片)
   */
  async archiveComicToS3(comicPath: string, images: string[]): Promise<void> {
    console.log(
      `Archiving comic: ${comicPath}, total images: ${images.length}`,
    );
    let processed = 0;

    // 使用 Promise.all 并发处理，但建议分批处理以避免内存爆炸或过多的并发请求
    // 这里简单起见，假设一次处理一本漫画的几百张图片是可以的。
    // 如果图片非常多，可以考虑 p-limit 或手动分批。
    const BATCH_SIZE = 10;

    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (imagePath) => {
          try {
            await this.prepareImageOnS3(comicPath, imagePath);
            processed++;
          } catch (e) {
            console.error(
              `Failed to archive image ${imagePath} in ${comicPath}:`,
              e,
            );
            throw e; // Fail fast or continue? Fail fast is safer for data integrity
          }
        }),
      );
      if (processed % 50 === 0) {
        console.log(`Archived ${processed}/${images.length} images...`);
      }
    }
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
