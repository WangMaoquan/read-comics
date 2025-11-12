/**
 * 文件处理工具函数
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ComicFormat } from '@read-comics/types';

export interface FileStats {
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
  isFile: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  extension: string;
  size: number;
  format: ComicFormat;
  stats: FileStats;
}

/**
 * 获取文件统计信息
 */
export async function getFileStats(filePath: string): Promise<FileStats> {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
    };
  } catch (error) {
    throw new Error(`无法获取文件统计信息: ${filePath}`);
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase().slice(1);
}

/**
 * 根据文件扩展名判断漫画格式
 */
export function getComicFormat(filePath: string): ComicFormat {
  const extension = getFileExtension(filePath);

  switch (extension) {
    case 'pdf':
      return ComicFormat.PDF;
    case 'cbz':
      return ComicFormat.CBZ;
    case 'cbr':
      return ComicFormat.CBR;
    case 'zip':
      return ComicFormat.ZIP;
    case 'rar':
      return ComicFormat.RAR;
    default:
      return ComicFormat.FOLDER;
  }
}

/**
 * 获取文件信息
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await getFileStats(filePath);
  const extension = getFileExtension(filePath);

  return {
    name: path.basename(filePath),
    path: filePath,
    extension,
    size: stats.size,
    format: getComicFormat(filePath),
    stats,
  };
}

/**
 * 递归获取目录中的所有文件
 */
export async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`读取目录失败: ${dirPath}`, error);
  }

  return files;
}

/**
 * 获取目录中的漫画文件
 */
export async function getComicFiles(dirPath: string): Promise<FileInfo[]> {
  const allFiles = await getAllFiles(dirPath);
  const comicFiles: FileInfo[] = [];

  for (const filePath of allFiles) {
    const format = getComicFormat(filePath);
    if (format !== ComicFormat.FOLDER) {
      try {
        const fileInfo = await getFileInfo(filePath);
        comicFiles.push(fileInfo);
      } catch (error) {
        console.warn(`获取文件信息失败: ${filePath}`, error);
      }
    }
  }

  return comicFiles;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 创建目录（如果不存在）
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * 复制文件
 */
export async function copyFile(
  srcPath: string,
  destPath: string,
): Promise<void> {
  await ensureDirectory(path.dirname(destPath));
  await fs.copyFile(srcPath, destPath);
}

/**
 * 移动文件
 */
export async function moveFile(
  srcPath: string,
  destPath: string,
): Promise<void> {
  await ensureDirectory(path.dirname(destPath));
  await fs.rename(srcPath, destPath);
}

/**
 * 删除文件
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error(`删除文件失败: ${filePath}`);
  }
}

/**
 * 清空目录
 */
export async function emptyDirectory(dirPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await deleteDirectory(fullPath);
      } else {
        await deleteFile(fullPath);
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * 删除目录
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  await emptyDirectory(dirPath);
  await fs.rmdir(dirPath);
}

/**
 * 获取文件的MIME类型
 */
export function getMimeType(filePath: string): string {
  const extension = getFileExtension(filePath);

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    pdf: 'application/pdf',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    cbz: 'application/zip',
    cbr: 'application/x-rar-compressed',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * 检查文件是否为支持的漫画格式
 */
export function isSupportedComicFormat(filePath: string): boolean {
  const format = getComicFormat(filePath);
  return format !== ComicFormat.FOLDER;
}

/**
 * 获取文件的安全文件名
 */
export function getSafeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * 生成唯一的文件名
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = path.basename(originalName, `.${extension}`);
  const safeBaseName = getSafeFileName(baseName);

  return `${safeBaseName}_${timestamp}_${random}.${extension}`;
}
