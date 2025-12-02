import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as yauzl from 'yauzl';
import * as iconv from 'iconv-lite';

/**
 * Promisified version of yauzl.open
 */
function openZip(
  path: string,
  options?: yauzl.Options,
): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(path, options || {}, (err, zipfile) => {
      if (err) reject(err);
      else resolve(zipfile!);
    });
  });
}

/**
 * ZIP 文件处理工具服务
 * 提供异步、非阻塞的 ZIP 文件操作
 */
@Injectable()
export class ZipUtilsService {
  /**
   * 从 ZIP 文件中提取指定文件
   * @param zipPath ZIP 文件路径
   * @param filePath 文件在 ZIP 中的路径
   * @returns 文件内容的 Buffer
   */
  async extractFileFromZip(zipPath: string, filePath: string): Promise<Buffer> {
    try {
      const zipfile = await openZip(zipPath, { lazyEntries: true });

      return new Promise<Buffer>((resolve, reject) => {
        let found = false;

        zipfile.on('entry', (entry: yauzl.Entry) => {
          const entryName = this.decodeFileName(entry.fileName);

          if (entryName === filePath) {
            found = true;
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                zipfile.close();
                reject(
                  new InternalServerErrorException(
                    `Failed to open read stream: ${err.message}`,
                  ),
                );
                return;
              }

              const chunks: Buffer[] = [];
              readStream.on('data', (chunk) => chunks.push(chunk));
              readStream.on('end', () => {
                zipfile.close();
                resolve(Buffer.concat(chunks));
              });
              readStream.on('error', (error) => {
                zipfile.close();
                reject(
                  new InternalServerErrorException(
                    `Failed to read file: ${error.message}`,
                  ),
                );
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          if (!found) {
            reject(
              new InternalServerErrorException(
                `File not found in ZIP: ${filePath}`,
              ),
            );
          }
        });

        zipfile.on('error', (error) => {
          reject(
            new InternalServerErrorException(
              `Failed to read ZIP file: ${error.message}`,
            ),
          );
        });

        zipfile.readEntry();
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to open ZIP file: ${error.message}`,
      );
    }
  }

  /**
   * 列出 ZIP 文件中的所有文件
   * @param zipPath ZIP 文件路径
   * @returns 文件路径数组
   */
  async listFilesInZip(
    zipPath: string,
  ): Promise<{ originName: string; decodeName: string }[]> {
    try {
      const zipfile = await openZip(zipPath, { lazyEntries: true });

      return new Promise<{ originName: string; decodeName: string }[]>(
        (resolve, reject) => {
          const files: { originName: string; decodeName: string }[] = [];

          zipfile.on('entry', (entry: yauzl.Entry) => {
            // @ts-ignore 只有 fileNameRaw 属性能 获取到原本的 文件 buffer
            const fileNameRaw = entry.fileNameRaw as Buffer;
            const originName = entry.fileName;
            const decodeName = this.decodeFileName(fileNameRaw);
            // 只列出文件，不包括目录
            if (!decodeName.endsWith('/')) {
              files.push({
                originName,
                decodeName,
              });
            }
            zipfile.readEntry();
          });

          zipfile.on('end', () => {
            zipfile.close();
            resolve(files);
          });

          zipfile.on('error', (error) => {
            reject(
              new InternalServerErrorException(
                `Failed to read ZIP file: ${error.message}`,
              ),
            );
          });

          zipfile.readEntry();
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to open ZIP file: ${error.message}`,
      );
    }
  }

  /**
   * 获取 ZIP 文件中的图片文件列表
   * @param zipPath ZIP 文件路径
   * @param imageExtensions 图片扩展名数组
   * @returns 图片文件路径数组
   */
  async listImagesInZip(
    zipPath: string,
    imageExtensions: string[] = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.bmp',
    ],
  ): Promise<{ originName: string; decodeName: string }[]> {
    const allFiles = await this.listFilesInZip(zipPath);
    return allFiles.filter((file) => {
      const ext = file.originName.toLowerCase().split('.').pop();
      return ext && imageExtensions.includes(`.${ext}`);
    });
  }

  /**
   * 检查文件是否存在于 ZIP 中
   * @param zipPath ZIP 文件路径
   * @param filePath 文件路径
   * @returns 是否存在
   */
  async fileExistsInZip(zipPath: string, filePath: string): Promise<boolean> {
    try {
      const files = (await this.listFilesInZip(zipPath)).map(
        (file) => file.originName,
      );
      return files.includes(filePath);
    } catch {
      return false;
    }
  }

  /**
   * 解码文件名，处理不同编码
   * @param rawFileName 原始文件名 Buffer
   * @returns 解码后的文件名
   */
  private decodeFileName(rawFileName: Buffer | string): string {
    if (typeof rawFileName === 'string') {
      return rawFileName;
    }

    // 尝试多种编码
    const encodings = ['utf8', 'gbk', 'gb2312', 'big5'];
    for (const encoding of encodings) {
      try {
        const decoded =
          encoding === 'utf8'
            ? rawFileName.toString('utf8')
            : iconv.decode(rawFileName, encoding);
        // 检查是否包含乱码字符
        if (!decoded.includes('�')) {
          return decoded;
        }
      } catch {
        continue;
      }
    }

    // 如果所有编码都失败，返回 UTF-8 解码结果
    return rawFileName.toString('utf8');
  }
}
