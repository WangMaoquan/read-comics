import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs, createReadStream } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import * as sharp from 'sharp';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class ImagesService implements OnModuleInit {
  private cachePath: string;
  private thumbnailPath: string;
  private cacheSize: number = 100; // 缓存最近100张图片
  private cache: Map<string, { data: Buffer; timestamp: number }> = new Map();

  constructor(private configService: ConfigService) {
    this.cachePath = this.configService.get<string>('CACHE_PATH', './cache');
    this.thumbnailPath = join(this.cachePath, 'thumbnails');
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
      throw new Error(`Failed to generate thumbnail: ${error.message}`);
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
      throw new Error(`Failed to optimize image: ${error.message}`);
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
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  /**
   * 从缓存获取图片
   */
  async getCachedImage(cacheKey: string): Promise<Buffer | null> {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      // 更新访问时间
      cached.timestamp = Date.now();
      return cached.data;
    }
    return null;
  }

  /**
   * 缓存图片
   */
  async cacheImage(cacheKey: string, imageBuffer: Buffer): Promise<void> {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data: imageBuffer,
      timestamp: Date.now(),
    });
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
      if (
        ext === '.cbz' ||
        ext === '.zip' ||
        ext === '.cbr' ||
        ext === '.rar'
      ) {
        // 使用 adm-zip 读取压缩包
        // 注意：adm-zip 是同步的，对于大文件可能会阻塞事件循环
        // 生产环境建议使用 stream-based 的库如 yauzl 或 unzipper，或者放到 worker 线程
        // 这里为了简单起见暂时使用 adm-zip
        const zip = new (require('adm-zip'))(comicPath);
        const entry = zip.getEntry(imagePath);

        if (!entry) {
          throw new Error(`Image not found in archive: ${imagePath}`);
        }

        return entry.getData();
      }

      throw new Error(`Unsupported comic format: ${ext}`);
    } catch (error) {
      console.error('Error extracting image from comic:', error);
      throw new Error(`Failed to extract image: ${error.message}`);
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
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    // 清理磁盘上的过期文件
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
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cacheSize,
      hitRate: 0, // 需要实现命中率统计
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
