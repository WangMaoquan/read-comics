/**
 * 重试管理器
 * 提供自动重试功能，支持指数退避策略
 */

export interface RetryConfig {
  /** 是否启用重试 */
  enabled: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 初始重试延迟（毫秒） */
  retryDelay: number;
  /** 可重试的 HTTP 状态码 */
  retryableStatuses: number[];
  /** 是否对网络错误重试 */
  retryOnNetworkError: boolean;
}

export class RetryManager {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000, // 1 秒
      retryableStatuses: config.retryableStatuses ?? [
        408, 429, 500, 502, 503, 504,
      ],
      retryOnNetworkError: config.retryOnNetworkError ?? true,
    };
  }

  /**
   * 执行带重试的请求
   */
  async execute<T>(
    executor: () => Promise<T>,
    context?: { method?: string; url?: string },
  ): Promise<T> {
    if (!this.config.enabled) {
      return executor();
    }

    let lastError: any;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        return await executor();
      } catch (error: any) {
        lastError = error;
        attempt++;

        // 检查是否应该重试
        if (attempt > this.config.maxRetries || !this.shouldRetry(error)) {
          throw error;
        }

        // 计算延迟时间（指数退避）
        const delay = this.calculateDelay(attempt);

        // 记录重试日志
        if (context) {
          console.warn(
            `Retrying request ${context.method} ${context.url} (attempt ${attempt}/${this.config.maxRetries}) after ${delay}ms`,
            error.message,
          );
        }

        // 等待后重试
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误
    if (this.config.retryOnNetworkError && this.isNetworkError(error)) {
      return true;
    }

    // HTTP 状态码错误
    if (error.response?.status) {
      return this.config.retryableStatuses.includes(error.response.status);
    }

    return false;
  }

  /**
   * 判断是否为网络错误
   */
  private isNetworkError(error: any): boolean {
    return (
      !error.response &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ENETUNREACH' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Network Error'))
    );
  }

  /**
   * 计算重试延迟（指数退避）
   */
  private calculateDelay(attempt: number): number {
    // 指数退避：delay * 2^(attempt-1)
    // 例如：1s, 2s, 4s, 8s...
    const exponentialDelay = this.config.retryDelay * Math.pow(2, attempt - 1);

    // 添加随机抖动，避免重试风暴
    const jitter = Math.random() * 0.3 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, 30000); // 最大 30 秒
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }
}
