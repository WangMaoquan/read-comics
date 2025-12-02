import { IS_DEVELOPMENT } from '../config';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * 日志接口
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  stack?: string;
}

/**
 * 日志管理器
 */
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      stack: level === LogLevel.ERROR ? new Error().stack : undefined,
    };

    // 保存日志
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 开发环境输出到控制台
    if (IS_DEVELOPMENT) {
      const prefix = `[${entry.timestamp.toISOString()}] [${level}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.log(prefix, message, data);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data);
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data, entry.stack);
          break;
      }
    }

    // 生产环境可以发送到日志服务
    // TODO: 实现发送到远程日志服务
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 错误日志
   */
  error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  clear() {
    this.logs = [];
  }

  /**
   * 导出日志
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// 导出单例
export const logger = new Logger();

// 全局错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    });
  });
}
