/**
 * 统一导出所有类型定义
 */

// 漫画相关类型
export * from './src/comic';

// VO 类型（用于前后端数据传输）
export * from './src/vo';

// API 相关类型
export * from './src/api';
export * from './src/user';

// 通用工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 事件相关类型
export interface BaseEvent {
  id: string;
  timestamp: Date;
  type: string;
}

export interface ComicEvent extends BaseEvent {
  type: 'comic_added' | 'comic_updated' | 'comic_deleted' | 'comic_read';
  comicId: string;
  data?: any;
}

export interface UserEvent extends BaseEvent {
  type: 'user_login' | 'user_logout' | 'preferences_updated';
  userId?: string;
  data?: any;
}

// 配置相关类型
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  storage: {
    comicsPath: string;
    tempPath: string;
    maxFileSize: number;
    allowedFormats: string[];
  };
}

// 日志相关类型
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

// 缓存相关类型
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt?: Date;
  createdAt: Date;
  accessedAt: Date;
  hitCount: number;
}

// 主题相关类型扩展
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}
