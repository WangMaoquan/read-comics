/**
 * API 配置
 */

// API 基础 URL，从环境变量读取
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4399';

// API 端点
export const API_ENDPOINTS = {
  // 认证相关
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },

  // 漫画相关
  comics: {
    list: '/comics',
    detail: (id: string) => `/comics/${id}`,
    chapters: (id: string) => `/chapters?comicId=${id}`,
  },

  // 章节相关
  chapters: {
    detail: (id: string) => `/chapters/${id}`,
  },

  // 文件相关
  files: {
    upload: '/files/upload',
    scan: '/files/scan',
    formats: '/files/formats',
  },

  // 图片相关
  images: {
    view: '/images/view',
    thumbnail: '/images/thumbnail',
    formats: '/images/formats',
  },
} as const;

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000;

// 支持的文件格式（仅 ZIP/CBZ）
export const SUPPORTED_FORMATS = ['.cbz', '.zip'] as const;

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
