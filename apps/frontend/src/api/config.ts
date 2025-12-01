/**
 * API 配置
 */

// API 基础 URL，从环境变量读取
// 后端已开启 CORS，直接请求后端地址
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4399';

// API 端点
export const API_ENDPOINTS = {
  // 漫画相关
  comics: {
    list: '/comics',
    detail: (id: string) => `/comics/${id}`,
    chapters: (id: string) => `/chapters?comicId=${id}`,
    progress: (id: string) => `/comics/${id}/progress`,
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

  // 认证相关
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },

  // 收藏相关
  favorites: {
    base: '/favorites',
    stats: '/favorites/stats',
    check: (comicId: string) => `/favorites/${comicId}`,
    update: (comicId: string) => `/favorites/${comicId}`,
    remove: (comicId: string) => `/favorites/${comicId}`,
  },

  // 标签相关
  tags: {
    base: '/tags',
    detail: (id: string) => `/tags/${id}`,
    update: (id: string) => `/tags/${id}`,
    delete: (id: string) => `/tags/${id}`,
    comics: (tagId: string) => `/tags/${tagId}/comics`,
    addToComic: (comicId: string, tagId: string) =>
      `/tags/comics/${comicId}/tags/${tagId}`,
    removeFromComic: (comicId: string, tagId: string) =>
      `/tags/comics/${comicId}/tags/${tagId}`,
  },
} as const;

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000;

// 支持的文件格式（仅 ZIP/CBZ）
export const SUPPORTED_FORMATS = ['.cbz', '.zip'] as const;

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
