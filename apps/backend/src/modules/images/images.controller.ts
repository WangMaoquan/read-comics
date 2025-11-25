import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { ImagesService, ImageOptions } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  /**
   * 生成缩略图
   */
  @Post('thumbnail')
  async generateThumbnail(
    @Query('comicPath') comicPath: string,
    @Query('imagePath') imagePath: string,
    @Query('width') width: number = 200,
    @Query('height') height: number = 300,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const thumbnailPath = await this.imagesService.generateAndCacheThumbnail(
        comicPath,
        imagePath,
        width,
        height,
      );

      const thumbnailBuffer =
        await this.imagesService.readFileStream(thumbnailPath);

      res.set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1年缓存
      });

      return new StreamableFile(thumbnailBuffer);
    } catch (error) {
      res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 优化图片
   */
  @Post('optimize')
  async optimizeImage(
    @Query('comicPath') comicPath: string,
    @Query('imagePath') imagePath: string,
    @Query('options') options: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const parsedOptions: ImageOptions = JSON.parse(options);

      // 从漫画文件中提取图片
      const imageBuffer = await this.imagesService.extractImageFromComic(
        comicPath,
        imagePath,
      );

      // 优化图片
      const optimizedBuffer = await this.imagesService.optimizeImage(
        imageBuffer,
        parsedOptions,
      );

      // 设置响应头
      const contentType = `image/${parsedOptions.format || 'jpeg'}`;
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      });

      return new StreamableFile(optimizedBuffer);
    } catch (error) {
      res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取图片信息
   */
  @Get('info/:comicPath/:imagePath')
  async getImageInfo(
    @Param('comicPath') comicPath: string,
    @Param('imagePath') imagePath: string,
  ) {
    try {
      // 从漫画文件中提取图片
      const imageBuffer = await this.imagesService.extractImageFromComic(
        comicPath,
        imagePath,
      );

      const info = await this.imagesService.getImageInfo(imageBuffer);

      return {
        success: true,
        data: info,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取缓存统计信息
   */
  @Get('cache/stats')
  getCacheStats() {
    return {
      success: true,
      data: this.imagesService.getCacheStats(),
    };
  }

  /**
   * 清理缓存
   */
  @Post('cache/clean')
  async cleanCache(@Query('maxAge') maxAge: number = 24 * 60 * 60 * 1000) {
    try {
      await this.imagesService.cleanExpiredCache(maxAge);
      return {
        success: true,
        message: 'Cache cleaned successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取支持的图片格式
   */
  @Get('formats')
  getSupportedFormats() {
    return {
      success: true,
      formats: [
        {
          format: 'jpeg',
          description: 'JPEG format with adjustable quality',
          qualityRange: [1, 100],
        },
        {
          format: 'png',
          description: 'PNG format with lossless compression',
          qualityRange: [1, 100],
        },
        {
          format: 'webp',
          description: 'WebP format with modern compression',
          qualityRange: [1, 100],
        },
        {
          format: 'avif',
          description: 'AV1 Image File format with best compression',
          qualityRange: [1, 100],
        },
      ],
    };
  }

  /**
   * 获取支持的缩略图尺寸
   */
  @Get('thumbnail-sizes')
  getThumbnailSizes() {
    return {
      success: true,
      sizes: [
        { width: 100, height: 150, description: 'Small thumbnails' },
        { width: 200, height: 300, description: 'Medium thumbnails' },
        { width: 400, height: 600, description: 'Large thumbnails' },
        { width: 800, height: 1200, description: 'Extra large thumbnails' },
      ],
    };
  }
}
