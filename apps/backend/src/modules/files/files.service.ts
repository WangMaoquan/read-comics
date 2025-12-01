import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { watch, FSWatcher } from 'chokidar';
import { ComicFormat, ComicStatus } from '@read-comics/types';
import { ZipUtilsService } from '../../common/utils/zip-utils.service';

@Injectable()
export class FilesService implements OnModuleInit {
  private comicsPath: string;
  private watchers: Map<string, FSWatcher> = new Map();
  private supportedFormats = ['.cbz', '.zip'];

  constructor(
    private configService: ConfigService,
    private zipUtilsService: ZipUtilsService,
  ) {
    this.comicsPath = this.configService.get<string>(
      'COMICS_PATH',
      './user-upload',
    );
  }

  /**
   * 获取漫画目录路径
   */
  getComicsPath(): string {
    return this.comicsPath;
  }

  async onModuleInit() {
    // 确保漫画目录存在
    await this.ensureDirectoryExists(this.comicsPath);

    // 开始监控漫画目录
    this.watchDirectory(this.comicsPath);
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
   * 扫描漫画目录
   */
  async scanComicsDirectory(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.comicsPath);
      const comicFiles = files.filter((file) =>
        this.supportedFormats.includes(extname(file).toLowerCase()),
      );

      return comicFiles.map((file) => join(this.comicsPath, file));
    } catch (error) {
      console.error('Error scanning comics directory:', error);
      return [];
    }
  }

  /**
   * 解析漫画文件
   */
  async parseComicFile(filePath: string): Promise<{
    title: string;
    totalPages: number;
    images: string[];
    format: ComicFormat;
    chapters: { title: string; pages: string[] }[];
  }> {
    const ext = extname(filePath).toLowerCase();

    if (ext === '.cbz' || ext === '.zip') {
      return this.parseArchiveFile(filePath);
    }

    throw new InternalServerErrorException(
      `Unsupported comic format: ${ext}. Only ZIP/CBZ formats are supported.`,
    );
  }

  /**
   * 解析压缩文件
   */
  private async parseArchiveFile(filePath: string): Promise<{
    title: string;
    totalPages: number;
    images: string[];
    format: ComicFormat;
    chapters: { title: string; pages: string[] }[];
  }> {
    const ext = extname(filePath).toLowerCase();
    const format = this.getComicFormat(ext);

    try {
      // 使用异步的 ZipUtilsService
      const allFiles = await this.zipUtilsService.listFilesInZip(filePath);

      // 过滤出图片文件
      const imageExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.bmp',
      ];

      const imageFiles = allFiles
        .filter((file) => {
          const ext = file.originName.toLowerCase().split('.').pop();
          return ext && imageExtensions.includes(`.${ext}`);
        })
        .sort((a, b) => {
          return a.decodeName.localeCompare(b.decodeName, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });

      // 提取文件名作为漫画标题
      const fileName = basename(filePath, extname(filePath));

      // 组织章节结构
      const chapters: { title: string; pages: string[] }[] = [];
      const rootImages: string[] = [];
      const folderMap = new Map<string, string[]>();

      // 计算公共前缀
      let commonPrefix = '';
      if (imageFiles.length > 0) {
        const firstEntry = imageFiles[0];
        const parts = firstEntry.originName.split('/');
        // 移除文件名，只保留目录
        parts.pop();

        for (let i = 0; i < parts.length; i++) {
          const prefix = parts.slice(0, i + 1).join('/') + '/';
          const allMatch = imageFiles.every((f) =>
            f.originName.startsWith(prefix),
          );
          if (allMatch) {
            commonPrefix = prefix;
          } else {
            break;
          }
        }
      }

      for (const file of imageFiles) {
        // 移除公共前缀
        const relativePath = file.decodeName.slice(commonPrefix.length);
        const parts = relativePath.split('/');

        if (parts.length > 1) {
          // 在子文件夹中
          const folderName = parts[0];
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, []);
          }
          // 保存进数据库不需要你使用 decodeName 字段, 因为你获取zip 中的图片时, 获取到的文件名是 originName
          folderMap.get(folderName)!.push(file.originName);
        } else {
          // 在根目录
          rootImages.push(file.originName);
        }
      }

      // 如果有根目录图片
      if (rootImages.length > 0) {
        // 如果没有子文件夹，说明是扁平结构，每个图片作为一个章节
        if (folderMap.size === 0) {
          rootImages.forEach((image, index) => {
            chapters.push({
              title: `第 ${index + 1} 话`,
              pages: [image],
            });
          });
        } else {
          // 如果有子文件夹，根目录图片归为一个默认章节
          chapters.push({
            title: '默认章节',
            pages: rootImages,
          });
        }
      }

      // 处理子文件夹章节
      for (const [folderName, pages] of folderMap.entries()) {
        chapters.push({
          title: folderName,
          pages: pages,
        });
      }

      // 如果没有识别出任何章节（例如空压缩包或只有根目录但上面逻辑漏了），确保至少有一个
      if (chapters.length === 0 && imageFiles.length > 0) {
        chapters.push({
          title: '默认章节',
          pages: imageFiles.map((f) => f.originName),
        });
      }

      return {
        title: fileName,
        totalPages: imageFiles.length,
        images: imageFiles.map((f) => f.originName),
        format,
        chapters,
      };
    } catch (error) {
      console.error('Error parsing archive file:', error);
      throw new InternalServerErrorException(
        `Failed to parse comic file: ${error.message}`,
      );
    }
  }

  /**
   * 获取漫画格式
   */
  private getComicFormat(ext: string): ComicFormat {
    switch (ext) {
      case '.cbz':
      case '.zip':
        return ComicFormat.CBZ;
      case '.cbr':
      case '.rar':
        return ComicFormat.CBR;
      default:
        return ComicFormat.CBZ; // 默认格式
    }
  }

  /**
   * 监控目录变化
   */
  private watchDirectory(path: string): void {
    const watcher = watch(path, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: false,
    });

    watcher
      .on('add', (filePath) => {
        console.log(`File added: ${filePath}`);
        // 可以在这里触发事件或通知其他服务
      })
      .on('change', (filePath) => {
        console.log(`File changed: ${filePath}`);
        // 可以在这里触发事件或通知其他服务
      })
      .on('unlink', (filePath) => {
        console.log(`File removed: ${filePath}`);
        // 可以在这里触发事件或通知其他服务
      })
      .on('error', (error) => {
        console.error(`Watcher error: ${error}`);
      });

    this.watchers.set(path, watcher);
  }

  /**
   * 停止监控目录
   */
  async stopWatching(path: string): Promise<void> {
    const watcher = this.watchers.get(path);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(path);
    }
  }

  /**
   * 停止所有监控
   */
  async stopAllWatching(): Promise<void> {
    const promises = Array.from(this.watchers.keys()).map((path) =>
      this.stopWatching(path),
    );
    await Promise.all(promises);
  }

  /**
   * 读取文件流
   */
  async readFileStream(filePath: string) {
    const fullPath = join(this.comicsPath, filePath);
    return createReadStream(fullPath);
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<{
    size: number;
    lastModified: Date;
    exists: boolean;
  }> {
    try {
      const fullPath = join(this.comicsPath, filePath);
      const stats = await fs.stat(fullPath);

      return {
        size: stats.size,
        lastModified: stats.mtime,
        exists: true,
      };
    } catch (error) {
      return {
        size: 0,
        lastModified: new Date(),
        exists: false,
      };
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = join(this.comicsPath, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }
}
