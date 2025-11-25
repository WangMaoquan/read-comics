/**
 * 漫画相关类型定义
 */

export interface Comic {
  id: string;
  title: string;
  author?: string;
  description?: string;
  coverPath?: string;
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
}

export interface Chapter {
  id: string;
  comicId: string;
  title: string;
  pageNumber: number;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id: string;
  comicId: string;
  chapterId: string;
  currentPage: number;
  totalPages: number;
  progress: number; // 0-100
  lastReadAt: Date;
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
  FOLDER = 'folder'
}

export enum ComicStatus {
  UNREAD = 'unread',
  READING = 'reading',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  DROPPED = 'dropped'
}

export enum ReadingMode {
  SINGLE_PAGE = 'single_page',
  DOUBLE_PAGE = 'double_page',
  CONTINUOUS_SCROLL = 'continuous_scroll'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export interface ComicFilter {
  search?: string;
  format?: ComicFormat[];
  status?: ComicStatus[];
  tags?: string[];
  author?: string;
  rating?: number;
  sortBy?: ComicSortBy;
  sortOrder?: 'asc' | 'desc';
}

export enum ComicSortBy {
  TITLE = 'title',
  AUTHOR = 'author',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  LAST_READ_AT = 'last_read_at',
  RATING = 'rating',
  FILE_SIZE = 'file_size'
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
