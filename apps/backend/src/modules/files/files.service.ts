import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, promises as fs } from 'fs';
import { join, extname, dirname, basename } from 'path';
import * as AdmZip from 'adm-zip';
import { watch, FSWatcher } from 'chokidar';
import { ComicFormat, ComicStatus } from '@read-comics/types';

@Injectable()
export class FilesService implements OnModuleInit {
  private comicsPath: string;
  private watchers: Map<string, FSWatcher> = new Map();
  private supportedFormats = ['.cbz', '.cbr', '.zip', '.rar', '.pdf'];

  constructor(private configService: ConfigService) {
    this.comicsPath = this.configService.get<string>('COMICS_PATH', './comics');
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
  }> {
    const ext = extname(filePath).toLowerCase();

    if (ext === '.cbz' || ext === '.zip' || ext === '.cbr' || ext === '.rar') {
      return this.parseArchiveFile(filePath);
    }

    throw new Error(`Unsupported comic format: ${ext}`);
  }

  /**
   * 解析压缩文件
   */
  private async parseArchiveFile(filePath: string): Promise<{
    title: string;
    totalPages: number;
    images: string[];
    format: ComicFormat;
  }> {
    const ext = extname(filePath).toLowerCase();
    const format = this.getComicFormat(ext);

    try {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();

      // 过滤出图片文件
      const imageExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.bmp',
      ];
      const imageFiles = entries
        .filter((entry) =>
          imageExtensions.includes(extname(entry.name).toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      // 提取文件名作为漫画标题
      const fileName = basename(filePath, extname(filePath));

      return {
        title: fileName,
        totalPages: imageFiles.length,
        images: imageFiles.map((entry) => entry.name),
        format,
      };
    } catch (error) {
      console.error('Error parsing archive file:', error);
      throw new Error(`Failed to parse comic file: ${error.message}`);
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
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
