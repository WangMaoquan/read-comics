/**
 * 环境变量配置
 */

// API 基础 URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4399';

// 图片服务 URL
export const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || API_BASE_URL;

// 应用名称
export const APP_NAME = import.meta.env.VITE_APP_NAME || '漫画阅读器';

// 应用版本
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// 是否为生产环境
export const IS_PRODUCTION = import.meta.env.PROD;

// 是否为开发环境
export const IS_DEVELOPMENT = import.meta.env.DEV;

// 调试模式
export const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

// 分页配置
export const PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 文件上传配置
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_FILE_TYPES = ['.cbz', '.zip'];

// Toast 默认配置
export const TOAST_DURATION = {
  success: 3000,
  error: 4000,
  warning: 3500,
  info: 3000,
};

// 本地存储 Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  READING_SETTINGS: 'reading_settings',
  UI_SETTINGS: 'ui_settings',
} as const;
