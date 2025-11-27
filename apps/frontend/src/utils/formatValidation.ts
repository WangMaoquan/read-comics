import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '../api/config';

/**
 * 文件格式验证结果
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证文件格式
 */
export function validateFileFormat(filename: string): ValidationResult {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();

  if (!SUPPORTED_FORMATS.includes(ext as any)) {
    return {
      valid: false,
      error: `不支持的文件格式。仅支持: ${SUPPORTED_FORMATS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * 验证文件大小
 */
export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return {
      valid: false,
      error: `文件大小超过限制 (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * 验证文件（格式 + 大小）
 */
export function validateFile(file: File): ValidationResult {
  // 验证格式
  const formatResult = validateFileFormat(file.name);
  if (!formatResult.valid) {
    return formatResult;
  }

  // 验证大小
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  return { valid: true };
}

/**
 * 获取支持的格式列表（用于显示）
 */
export function getSupportedFormatsText(): string {
  return SUPPORTED_FORMATS.join(', ');
}
