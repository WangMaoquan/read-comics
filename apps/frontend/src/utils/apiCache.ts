/**
 * 缓存项
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * 缓存配置
 */
interface CacheConfig {
  ttl?: number; // 缓存时间(毫秒)
  maxSize?: number; // 最大缓存数量
}

/**
 * API 缓存管理器
 */
export class ApiCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 默认 5 分钟
  private maxSize = 100;

  constructor(config?: CacheConfig) {
    if (config?.ttl) this.defaultTTL = config.ttl;
    if (config?.maxSize) this.maxSize = config.maxSize;
  }

  /**
   * 生成缓存键
   */
  private generateKey(endpoint: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsStr}`;
  }

  /**
   * 设置缓存
   */
  set<T>(endpoint: string, data: T, params?: any, ttl?: number): void {
    const key = this.generateKey(endpoint, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // 如果缓存已满,删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(endpoint: string, params?: any): T | null {
    const key = this.generateKey(endpoint, params);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(endpoint: string, params?: any): boolean {
    return this.get(endpoint, params) !== null;
  }

  /**
   * 删除缓存
   */
  delete(endpoint: string, params?: any): boolean {
    const key = this.generateKey(endpoint, params);
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清空过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取最旧的缓存键
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        timestamp: new Date(item.timestamp),
        expiresAt: new Date(item.expiresAt),
        isExpired: Date.now() > item.expiresAt,
      })),
    };
  }
}

// 导出默认实例
export const apiCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 5 分钟
  maxSize: 100,
});

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.clearExpired();
  }, 60 * 1000); // 每分钟清理一次
}
