/**
 * API 相关类型定义
 */

import { 
  Comic, 
  Chapter, 
  ReadingProgress, 
  UserPreferences, 
  ComicFilter, 
  ComicStats,
  ComicStatus,
  ReadingMode,
  Theme
} from './comic';

// 基础 API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 漫画相关 API 类型
export interface CreateComicRequest {
  title: string;
  author?: string;
  description?: string;
  filePath: string;
  tags?: string[];
}

export interface UpdateComicRequest {
  title?: string;
  author?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  status?: ComicStatus;
}

export interface ComicListQuery extends ComicFilter {
  page?: number;
  pageSize?: number;
}

// 章节相关 API 类型
export interface CreateChapterRequest {
  comicId: string;
  title: string;
  pageNumber: number;
  imagePath: string;
}

export interface UpdateChapterRequest {
  title?: string;
  pageNumber?: number;
  imagePath?: string;
}

// 阅读进度相关 API 类型
export interface UpdateReadingProgressRequest {
  comicId: string;
  chapterId: string;
  currentPage: number;
  totalPages: number;
}

// 用户偏好相关 API 类型
export interface UpdateUserPreferencesRequest {
  readingMode?: ReadingMode;
  theme?: Theme;
  language?: string;
  autoSaveProgress?: boolean;
  pageTransition?: boolean;
  showPageNumbers?: boolean;
  doublePageMode?: boolean;
  fitToScreen?: boolean;
}

// 文件相关 API 类型
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data?: Buffer | string; // 用于文件上传
}

export interface FileUploadRequest {
  file: FileInfo;
  comicId?: string;
  chapterId?: string;
}

export interface FileUploadResponse {
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

// 搜索相关 API 类型
export interface SearchRequest {
  query: string;
  type: SearchType;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

export enum SearchType {
  COMICS = 'comics',
  CHAPTERS = 'chapters',
  TAGS = 'tags',
  AUTHORS = 'authors'
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  searchType: SearchType;
  executionTime: number; // in milliseconds
}

// 错误相关 API 类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

// WebSocket 相关类型
export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: Date;
}

export enum WebSocketMessageType {
  COMIC_ADDED = 'comic_added',
  COMIC_UPDATED = 'comic_updated',
  COMIC_DELETED = 'comic_deleted',
  READING_PROGRESS_UPDATED = 'reading_progress_updated',
  FILE_SCAN_PROGRESS = 'file_scan_progress',
  NOTIFICATION = 'notification'
}

// 导出所有 API 相关类型
export type {
  Comic,
  Chapter,
  ReadingProgress,
  UserPreferences,
  ComicFilter,
  ComicStats
};
