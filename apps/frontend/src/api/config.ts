/**
 * API 配置
 */

// API 基础 URL，从环境变量读取
// 后端已开启 CORS，直接请求后端地址
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4399';

// API 端点

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000;

// 支持的文件格式（仅 ZIP/CBZ）
export const SUPPORTED_FORMATS = ['.cbz', '.zip'] as const;

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
