/**
 * 请求去重管理器
 * 防止短时间内重复发送相同请求
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class DeduplicationManager {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private readonly timeout: number;

  constructor(timeout: number = 30000) {
    // 默认 30 秒超时
    this.timeout = timeout;
  }

  /**
   * 生成请求键
   */
  private generateKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
  }

  /**
   * 获取或创建请求
   * 如果相同请求正在进行中，返回现有 Promise
   * 否则执行新请求并缓存 Promise
   */
  async deduplicate<T>(
    method: string,
    url: string,
    executor: () => Promise<T>,
    params?: any,
  ): Promise<T> {
    const key = this.generateKey(method, url, params);
    const existing = this.pendingRequests.get(key);

    // 检查是否有进行中的请求
    if (existing) {
      const age = Date.now() - existing.timestamp;
      // 如果请求未超时，复用现有 Promise
      if (age < this.timeout) {
        return existing.promise;
      } else {
        // 超时的请求清理掉
        this.pendingRequests.delete(key);
      }
    }

    // 创建新请求
    const promise = executor()
      .then((result) => {
        // 请求完成后清理
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // 请求失败也要清理
        this.pendingRequests.delete(key);
        throw error;
      });

    // 缓存 Promise
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * 清除指定请求
   */
  clear(method: string, url: string, params?: any): void {
    const key = this.generateKey(method, url, params);
    this.pendingRequests.delete(key);
  }

  /**
   * 清除所有请求
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }

  /**
   * 清除超时的请求
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > this.timeout) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.pendingRequests.delete(key));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      timeout: this.timeout,
    };
  }
}
