/**
 * 漫画相关类型定义
 */

export interface Comic {
  id: string;
  title: string;
  author?: string;
  description?: string;
  cover?: string;
  filePath: string;
  fileSize: number;
  fileFormat: ComicFormat;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
  lastReadAt?: Date;
  tags?: string[];
  rating?: number;
  status: ComicStatus;
  isFavorite?: boolean;
  readingProgress?: ReadingProgress[];
  progress?: number;
}

export interface Chapter {
  id: string;
  comicId: string;
  title: string;
  pageNumber: number;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
  pages: string[];
  readingProgress?: ReadingProgress;
}

export interface ReadingProgress {
  id: string;
  comicId: string;
  chapterId: string;
  currentPage: number;
  totalPages: number;
  progress: number; // 0-100
  lastReadAt: Date;
  isReadComplete: boolean;
}

export interface UserPreferences {
  id: string;
  readingMode: ReadingMode;
  theme: Theme;
  language: string;
  autoSaveProgress: boolean;
  pageTransition: boolean;
  showPageNumbers: boolean;
  doublePageMode: boolean;
  fitToScreen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ComicFormat {
  PDF = 'pdf',
  CBZ = 'cbz',
  CBR = 'cbr',
  ZIP = 'zip',
  RAR = 'rar',
  FOLDER = 'folder',
}

export enum ComicStatus {
  UNREAD = 'unread',
  READING = 'reading',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  DROPPED = 'dropped',
}

export enum ReadingMode {
  SINGLE_PAGE = 'single_page',
  DOUBLE_PAGE = 'double_page',
  CONTINUOUS_SCROLL = 'continuous_scroll',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export interface ComicFilter {
  search?: string;
  format?: string[];
  status?: string[];
  isFavorite?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number; // 页码，从 1 开始
  pageSize?: number; // 每页数量，默认 20
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum ComicSortBy {
  TITLE = 'title',
  AUTHOR = 'author',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  LAST_READ_AT = 'last_read_at',
  RATING = 'rating',
  FILE_SIZE = 'file_size',
}

export interface ComicStats {
  totalComics: number;
  totalPages: number;
  completedComics: number;
  readingComics: number;
  unreadComics: number;
  totalReadingTime: number; // in minutes
  averageRating: number;
}
