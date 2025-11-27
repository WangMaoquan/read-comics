import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  StreamableFile,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { ComicFormat } from '@read-comics/types';
import { ComicsService } from '../comics/comics.service';
import { ChaptersService } from '../chapters/chapters.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly comicsService: ComicsService,
    private readonly chaptersService: ChaptersService,
  ) {}

  /**
   * 计算文件的MD5哈希值
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5');
      const stream = createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (error) => reject(error));
    });
  }

  /**
   * 上传漫画文件
   */
  @Post('upload')
  @ApiOperation({ summary: '上传漫画文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '上传成功' })
  @ApiResponse({ status: 400, description: '文件格式不支持' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './comics', // 直接使用默认路径
        filename: (req, file, cb) => {
          // 使用唯一文件名,防止同名不同内容的文件相互覆盖
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const nameWithoutExt = file.originalname.slice(0, -ext.length);
          cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const supportedFormats = ['.cbz', '.zip'];
        const ext = extname(file.originalname).toLowerCase();
        if (supportedFormats.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('不支持的文件格式。仅支持 ZIP/CBZ 格式。'),
            false,
          );
        }
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
    }),
  )
  async uploadComicFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    try {
      // 1. 计算文件哈希
      const hash = await this.calculateFileHash(file.path);

      // 2. 检查文件是否已存在(通过哈希值)
      const existingComic = await this.comicsService.findByHash(hash);
      if (existingComic) {
        // 删除刚上传的文件
        await this.filesService.deleteFile(file.filename);
        throw new BadRequestException(
          `文件 "${file.originalname}" 已存在(检测到相同内容)，请勿重复上传`,
        );
      }

      // 3. 解析上传的文件
      const parseResult = await this.filesService.parseComicFile(file.path);

      // 获取原始文件名(不含扩展名)作为标题
      const ext = extname(file.originalname);
      const originalTitle = file.originalname.slice(0, -ext.length);

      // 4. 创建漫画记录
      const comic = await this.comicsService.create({
        title: originalTitle, // 使用原始文件名作为标题
        filePath: file.path,
        fileFormat: parseResult.format,
        fileSize: file.size,
        totalPages: parseResult.totalPages,
        author: '未知',
        status: 'unread' as any,
        hash: hash, // 保存文件哈希
        chapters: parseResult.chapters, // 直接传入章节数据
      });

      return {
        success: true,
        message: '文件上传并导入成功',
        data: {
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          path: file.path,
          comic: {
            id: comic.id,
            title: comic.title,
            chaptersCount: parseResult.chapters.length,
          },
        },
      };
    } catch (error) {
      console.error('文件处理失败:', error);

      // 如果是文件已存在的错误，直接抛出
      if (error instanceof BadRequestException) {
        throw error;
      }

      // 其他错误，尝试删除已上传的文件
      try {
        await this.filesService.deleteFile(file.filename);
      } catch (deleteError) {
        console.error('删除文件失败:', deleteError);
      }

      throw new BadRequestException(
        `文件处理失败: ${error.message || '未知错误'}`,
      );
    }
  }

  /**
   * 扫描漫画目录
   */
  @Get('scan')
  @ApiOperation({ summary: '扫描漫画目录' })
  @ApiResponse({ status: 200, description: '扫描成功' })
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
  @ApiOperation({ summary: '解析漫画文件' })
  @ApiParam({ name: 'filePath', description: '文件路径' })
  @ApiResponse({ status: 200, description: '解析成功' })
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
  @ApiOperation({ summary: '获取文件信息' })
  @ApiParam({ name: 'filePath', description: '文件路径' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
  @ApiOperation({ summary: '读取文件流' })
  @ApiParam({ name: 'filePath', description: '文件路径' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
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
  @ApiOperation({ summary: '删除文件' })
  @ApiParam({ name: 'filePath', description: '文件路径' })
  @ApiResponse({ status: 200, description: '删除成功' })
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
  @ApiOperation({ summary: '获取支持的漫画格式' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
          extension: '.zip',
          format: ComicFormat.CBZ,
          description: 'ZIP archive format',
        },
      ],
    };
  }
}
