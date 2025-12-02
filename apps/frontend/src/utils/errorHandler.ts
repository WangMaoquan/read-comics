import { toast } from '../composables/useToast';
import { logger } from './logger';

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  data?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    options?: {
      code?: string;
      statusCode?: number;
      data?: any;
      cause?: Error;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = options?.code;
    this.statusCode = options?.statusCode;
    this.data = options?.data;

    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * 错误处理器配置
 */
interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  rethrow?: boolean;
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  /**
   * 处理错误
   */
  static handle(
    error: unknown,
    options: ErrorHandlerOptions = {
      showToast: true,
      logError: true,
      rethrow: false,
    },
  ): AppError {
    const appError = this.normalizeError(error);

    // 记录日志
    if (options.logError) {
      logger.error(appError.message, {
        type: appError.type,
        code: appError.code,
        statusCode: appError.statusCode,
        data: appError.data,
        stack: appError.stack,
      });
    }

    // 显示 Toast
    if (options.showToast) {
      this.showErrorToast(appError);
    }

    // 重新抛出
    if (options.rethrow) {
      throw appError;
    }

    return appError;
  }

  /**
   * 标准化错误
   */
  private static normalizeError(error: unknown): AppError {
    // 已经是 AppError
    if (error instanceof AppError) {
      return error;
    }

    // 标准 Error
    if (error instanceof Error) {
      // 网络错误
      if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        return new AppError('网络连接失败,请检查网络设置', ErrorType.NETWORK, {
          cause: error,
        });
      }

      // 超时错误
      if (error.message.includes('timeout')) {
        return new AppError('请求超时,请稍后重试', ErrorType.NETWORK, {
          cause: error,
        });
      }

      return new AppError(error.message, ErrorType.UNKNOWN, {
        cause: error,
      });
    }

    // HTTP 错误响应
    if (typeof error === 'object' && error !== null) {
      const err = error as any;

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.message;

        if (status === 401) {
          return new AppError('未授权,请重新登录', ErrorType.AUTH, {
            statusCode: status,
            data: err.response.data,
          });
        }

        if (status === 403) {
          return new AppError('没有权限执行此操作', ErrorType.AUTH, {
            statusCode: status,
            data: err.response.data,
          });
        }

        if (status === 404) {
          return new AppError('请求的资源不存在', ErrorType.NOT_FOUND, {
            statusCode: status,
            data: err.response.data,
          });
        }

        if (status >= 400 && status < 500) {
          return new AppError(message || '请求参数错误', ErrorType.VALIDATION, {
            statusCode: status,
            data: err.response.data,
          });
        }

        if (status >= 500) {
          return new AppError('服务器错误,请稍后重试', ErrorType.SERVER, {
            statusCode: status,
            data: err.response.data,
          });
        }
      }
    }

    // 字符串错误
    if (typeof error === 'string') {
      return new AppError(error, ErrorType.UNKNOWN);
    }

    // 未知错误
    return new AppError('发生未知错误', ErrorType.UNKNOWN, {
      data: error,
    });
  }

  /**
   * 显示错误 Toast
   */
  private static showErrorToast(error: AppError) {
    const message = this.getUserFriendlyMessage(error);
    toast.error(message);
  }

  /**
   * 获取用户友好的错误消息
   */
  private static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return error.message || '网络连接失败';
      case ErrorType.AUTH:
        return error.message || '认证失败';
      case ErrorType.VALIDATION:
        return error.message || '输入数据有误';
      case ErrorType.NOT_FOUND:
        return error.message || '资源不存在';
      case ErrorType.SERVER:
        return '服务器错误,请稍后重试';
      default:
        return error.message || '操作失败,请重试';
    }
  }
}

/**
 * 便捷的错误处理函数
 */
export function handleError(
  error: unknown,
  customMessage?: string,
  options?: ErrorHandlerOptions,
): AppError {
  const appError = ErrorHandler.handle(error, options);

  if (customMessage) {
    appError.message = customMessage;
  }

  return appError;
}

/**
 * 异步函数错误包装器
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlerOptions,
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.handle(error, options);
      throw error;
    }
  }) as T;
}
