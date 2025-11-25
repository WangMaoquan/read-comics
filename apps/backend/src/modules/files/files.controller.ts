import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { ComicFormat } from '@read-comics/types';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * 扫描漫画目录
   */
  @Get('scan')
  async scanComicsDirectory() {
    const files = await this.filesService.scanComicsDirectory();
    return {
      success: true,
      count: files.length,
      files,
    };
  }

  /**
   * 解析漫画文件
   */
  @Get('parse/:filePath')
  async parseComicFile(@Param('filePath') filePath: string) {
    try {
      const result = await this.filesService.parseComicFile(filePath);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取文件信息
   */
  @Get('info/:filePath')
  async getFileInfo(@Param('filePath') filePath: string) {
    const info = await this.filesService.getFileInfo(filePath);
    return {
      success: true,
      data: info,
    };
  }

  /**
   * 读取文件流
   */
  @Get('stream/:filePath')
  async readFileStream(
    @Param('filePath') filePath: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileStream = await this.filesService.readFileStream(filePath);
    const fileInfo = await this.filesService.getFileInfo(filePath);

    if (!fileInfo.exists) {
      res.status(404).send('File not found');
      return;
    }

    // 设置正确的 Content-Type
    const ext = filePath.toLowerCase().split('.').pop();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'bmp':
        contentType = 'image/bmp';
        break;
      case 'cbz':
      case 'zip':
        contentType = 'application/zip';
        break;
      case 'cbr':
      case 'rar':
        contentType = 'application/x-rar-compressed';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': fileInfo.size,
      'Last-Modified': fileInfo.lastModified.toUTCString(),
    });

    return new StreamableFile(fileStream);
  }

  /**
   * 删除文件
   */
  @Delete(':filePath')
  async deleteFile(@Param('filePath') filePath: string) {
    try {
      await this.filesService.deleteFile(filePath);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取支持的漫画格式
   */
  @Get('formats')
  getSupportedFormats() {
    return {
      success: true,
      formats: [
        {
          extension: '.cbz',
          format: ComicFormat.CBZ,
          description: 'Comic Book ZIP format',
        },
        {
          extension: '.cbr',
          format: ComicFormat.CBR,
          description: 'Comic Book RAR format',
        },
        {
          extension: '.zip',
          format: ComicFormat.CBZ,
          description: 'ZIP archive format',
        },
        {
          extension: '.rar',
          format: ComicFormat.CBR,
          description: 'RAR archive format',
        },
      ],
    };
  }
}
