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
  private generateCacheKey(filePath: string, options?: ImageOptions): string {
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
   * 优化图片
   */
  async optimizeImage(
    imageBuffer: Buffer,
    options: ImageOptions = {},
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 85,
      format = 'jpeg',
      fit = 'inside',
    } = options;

    try {
      const sharpInstance = sharp(imageBuffer);

      let processed = sharpInstance;

      // 调整大小
      if (width || height) {
        processed = processed.resize(width, height, {
          fit,
          withoutEnlargement: true,
        });
      }

      // 转换格式和质量
      switch (format) {
        case 'jpeg':
          processed = processed.jpeg({ quality });
          break;
        case 'png':
          processed = processed.png({ quality });
          break;
        case 'webp':
          processed = processed.webp({ quality });
          break;
        case 'avif':
          processed = processed.avif({ quality });
          break;
      }

      return await processed.toBuffer();
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw new InternalServerErrorException(
        `Failed to optimize image: ${error.message}`,
      );
    }
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(imageBuffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    aspectRatio: number;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
        aspectRatio: (metadata.width || 1) / (metadata.height || 1),
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      throw new InternalServerErrorException(
        `Failed to get image info: ${error.message}`,
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

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
