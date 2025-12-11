import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ImagesService, ImageOptions } from './images.service';
import { BypassTransform } from '@common/decorators/bypass-transform.decorator';
import { S3Service } from '../s3/s3.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 查看图片
   */
  @Get('view')
  @BypassTransform()
  @ApiOperation({ summary: '查看图片' })
  @ApiQuery({ name: 'comicPath', description: '漫画文件路径' })
  @ApiQuery({ name: 'imagePath', description: '图片在压缩包中的路径' })
  @ApiResponse({ status: 302, description: '重定向到 S3 URL' })
  async viewImage(
    @Query('comicPath') comicPath: string,
    @Query('imagePath') imagePath: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const key = await this.imagesService.prepareImageOnS3(
        comicPath,
        imagePath,
      );

      const url = await this.s3Service.getPresignedUrlWithCache(key);

      res.redirect(url);
    } catch (error) {
      res.status(404).send(error.message);
    }
  }

  /**
   * 生成缩略图
   */
  @Post('thumbnail')
  @BypassTransform()
  @ApiOperation({ summary: '生成缩略图' })
  @ApiQuery({ name: 'comicPath', description: '漫画文件路径' })
  @ApiQuery({ name: 'imagePath', description: '图片在压缩包中的路径' })
  @ApiQuery({
    name: 'width',
    description: '宽度',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'height',
    description: '高度',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 302, description: '重定向到 S3 URL' })
  async generateThumbnail(
    @Query('comicPath') comicPath: string,
    @Query('imagePath') imagePath: string,
    @Query('width') width: number = 200,
    @Query('height') height: number = 300,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const key = await this.imagesService.generateAndCacheThumbnail(
        comicPath,
        imagePath,
        width,
        height,
      );

      const url = await this.s3Service.getPresignedUrlWithCache(key);

      res.redirect(url);
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
  @BypassTransform()
  @ApiOperation({ summary: '优化图片' })
  @ApiQuery({ name: 'comicPath', description: '漫画文件路径' })
  @ApiQuery({ name: 'imagePath', description: '图片在压缩包中的路径' })
  @ApiQuery({ name: 'options', description: '优化选项 JSON 字符串' })
  @ApiResponse({ status: 200, description: '优化成功' })
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
  @ApiOperation({ summary: '获取图片信息' })
  @ApiParam({ name: 'comicPath', description: '漫画文件路径' })
  @ApiParam({ name: 'imagePath', description: '图片在压缩包中的路径' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
   * 获取支持的图片格式
   */
  @Get('formats')
  @ApiOperation({ summary: '获取支持的图片格式' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
  @ApiOperation({ summary: '获取支持的缩略图尺寸' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
