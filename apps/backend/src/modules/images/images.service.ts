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
import { StreamableFile } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { ZipUtilsService } from '@common/utils/zip-utils.service';

@Injectable()
export class ImagesService implements OnModuleInit {
  private cachePath: string;
  private thumbnailPath: string;
  private cache: LRUCache<string, Buffer>;

  constructor(
    private configService: ConfigService,
    private zipUtilsService: ZipUtilsService,
  ) {
    this.cachePath = this.configService.get<string>('CACHE_PATH', './cache');
    this.thumbnailPath = join(this.cachePath, 'thumbnails');

    // 初始化 LRU 缓存: 最多 100 个图片，最大 100MB
    this.cache = new LRUCache<string, Buffer>({
      max: 100,
      maxSize: 100 * 1024 * 1024, // 100MB
      sizeCalculation: (value) => value.length,
    });
  }

  async onModuleInit() {
    // 确保缓存目录存在
    await this.ensureDirectoryExists(this.cachePath);
    await this.ensureDirectoryExists(this.thumbnailPath);
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      await fs.access(path);
    } catch {
      await fs.mkdir(path, { recursive: true });
    }
  }

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
   * 从缓存获取图片
   */
  async getCachedImage(cacheKey: string): Promise<Buffer | null> {
    return this.cache.get(cacheKey) || null;
  }

  /**
   * 缓存图片
   */
  async cacheImage(cacheKey: string, imageBuffer: Buffer): Promise<void> {
    this.cache.set(cacheKey, imageBuffer);
  }

  /**
   * 生成并缓存缩略图
   */
  async generateAndCacheThumbnail(
    comicPath: string,
    imagePath: string,
    width: number = 200,
    height: number = 300,
  ): Promise<string> {
    const cacheKey = this.generateCacheKey(`${comicPath}/${imagePath}`, {
      width,
      height,
      format: 'jpeg',
    });

    // 检查缓存
    const cached = await this.getCachedImage(cacheKey);
    if (cached) {
      return this.saveThumbnailToDisk(cacheKey, cached);
    }

    // 从漫画文件中提取图片
    const imageBuffer = await this.extractImageFromComic(comicPath, imagePath);

    // 生成缩略图
    const thumbnail = await this.generateThumbnail(imageBuffer, width, height);

    // 缓存图片
    await this.cacheImage(cacheKey, thumbnail);

    // 保存到磁盘
    return this.saveThumbnailToDisk(cacheKey, thumbnail);
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

  /**
   * 读取文件流
   */
  async readFileStream(filePath: string) {
    return createReadStream(filePath);
  }

  /**
   * 保存缩略图到磁盘
   */
  private async saveThumbnailToDisk(
    cacheKey: string,
    thumbnail: Buffer,
  ): Promise<string> {
    const thumbnailPath = join(this.thumbnailPath, `${cacheKey}.jpg`);
    await fs.writeFile(thumbnailPath, thumbnail);
    return thumbnailPath;
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    // LRU 缓存会自动管理内存，这里只清理磁盘缓存
    const now = Date.now();
    const files = await fs.readdir(this.thumbnailPath);

    for (const file of files) {
      const filePath = join(this.thumbnailPath, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    itemCount: number;
    maxItems: number;
    currentSize: number;
    maxSize: number;
  } {
    return {
      itemCount: this.cache.size,
      maxItems: this.cache.max,
      currentSize: this.cache.calculatedSize || 0,
      maxSize: this.cache.maxSize || 0,
    };
  }
}

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
