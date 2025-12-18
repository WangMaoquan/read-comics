import { join, resolve, normalize, relative, isAbsolute } from 'path';
import { ForbiddenException } from '@nestjs/common';

/**
 * 路径安全工具
 */
export class PathUtils {
  /**
   * 安全地合并路径，并确保结果位于根目录之内
   * @param rootDir 根目录（基准路径）
   * @param relativePath 相对路径（可能包含 .. 等风险字符）
   * @returns 解析后的绝对路径
   * @throws ForbiddenException 如果解析后的路径超出了根目录
   */
  static safeJoin(rootDir: string, relativePath: string): string {
    // 1. 获取根目录的绝对路径
    const absoluteRoot = resolve(rootDir);

    // 2. 如果传入的是绝对路径，先尝试将其转为相对于根目录的路径（如果它确实在根目录下）
    // 或者直接拒绝绝对路径输入以提高安全性
    if (isAbsolute(relativePath)) {
      // 如果它在根目录下，保留它；否则拒绝
      if (!relativePath.startsWith(absoluteRoot)) {
        throw new ForbiddenException(
          'Access denied: Absolute path outside of root',
        );
      }
      return relativePath;
    }

    // 3. 合并并规范化路径
    const fullPath = resolve(join(absoluteRoot, relativePath));

    // 4. 检查结果是否以根目录开头
    const relativePart = relative(absoluteRoot, fullPath);

    // 如果结果包含 '..' 且不是以 '..' 开头（正常情况 relative 应该不会以 .. 开头如果它在内部）
    // 或者更简单的：检查 fullPath 是否以 absoluteRoot 开头
    if (relativePart.startsWith('..') || isAbsolute(relativePart)) {
      throw new ForbiddenException('Access denied: Path traversal detected');
    }

    return fullPath;
  }
}
