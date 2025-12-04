/**
 * 缓存管理器
 * 基于 frontend 的 apiCache 实现，提供请求缓存功能
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  /** 默认缓存有效期（毫秒），默认 5 分钟 */
  ttl?: number;
  /** 最大缓存条目数 */
  maxSize?: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number;
  private maxSize: number;

  constructor(config: CacheConfig = {}) {
    this.defaultTTL = config.ttl ?? 5 * 60 * 1000; // 5 分钟
    this.maxSize = config.maxSize ?? 100;
  }

  /**
   * 生成缓存键
   */
  private generateKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
  }

  /**
   * 获取缓存
   */
  get<T>(method: string, url: string, params?: any): T | null {
    const key = this.generateKey(method, url, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T>(
    method: string,
    url: string,
    data: T,
    params?: any,
    ttl?: number,
  ): void {
    const key = this.generateKey(method, url, params);
    const now = Date.now();

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl ?? this.defaultTTL),
    });
  }

  /**
   * 清除指定缓存
   */
  invalidate(method: string, url: string, params?: any): void {
    const key = this.generateKey(method, url, params);
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 驱逐最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.defaultTTL,
    };
  }
}
