import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { CacheManager, type CacheConfig } from './cache';
import { DeduplicationManager } from './deduplication';
import { RetryManager, type RetryConfig } from './retry';

// 定义后端标准响应结构
export interface ApiResponse<T = any> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

export interface RequestOptions extends AxiosRequestConfig {
  /** 是否使用缓存 */
  useCache?: boolean;
  /** 缓存有效期（毫秒） */
  cacheTTL?: number;
  /** 是否启用请求去重 */
  deduplicate?: boolean;
  /** 是否启用重试 */
  retry?: boolean;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  onError?: (error: any) => void;
  /** 缓存配置 */
  cache?: Partial<CacheConfig>;
  /** 重试配置 */
  retry?: Partial<RetryConfig>;
}

export class ApiClient {
  public instance: AxiosInstance;
  public config: ApiClientConfig;
  private cacheManager: CacheManager;
  private deduplicationManager: DeduplicationManager;
  private retryManager: RetryManager;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 初始化管理器
    this.cacheManager = new CacheManager(config.cache);
    this.deduplicationManager = new DeduplicationManager();
    this.retryManager = new RetryManager(config.retry);

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.config.getToken?.();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      <T = any>(response: AxiosResponse<ApiResponse<T>>) => {
        // 解包双层结构：response.data.data
        return response.data.data as T;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.config.onUnauthorized?.();
        }

        this.config.onError?.(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 执行请求（内部方法，集成缓存、去重、重试）
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      useCache = false,
      cacheTTL,
      deduplicate = true,
      retry = true,
      ...axiosConfig
    } = options;

    // 1. 尝试从缓存获取
    if (useCache && method === 'GET') {
      const cached = this.cacheManager.get<T>(method, url, axiosConfig.params);
      if (cached !== null) {
        return cached;
      }
    }

    // 2. 定义请求执行器
    const executor = async (): Promise<T> => {
      const requestFn = async () => {
        return this.instance.request<any, T>({
          method,
          url,
          ...axiosConfig,
        });
      };

      // 3. 应用重试机制
      if (retry) {
        return this.retryManager.execute(requestFn, { method, url });
      }

      return requestFn();
    };

    // 4. 应用请求去重
    const result = deduplicate
      ? await this.deduplicationManager.deduplicate(
          method,
          url,
          executor,
          axiosConfig.params,
        )
      : await executor();

    // 5. 缓存结果
    if (useCache && method === 'GET') {
      this.cacheManager.set(method, url, result, axiosConfig.params, cacheTTL);
    }

    return result;
  }

  // 封装常用方法
  public async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>('GET', url, options);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>('POST', url, { ...options, data });
  }

  public async put<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>('PUT', url, { ...options, data });
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>('PATCH', url, { ...options, data });
  }

  public async delete<T = any>(
    url: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>('DELETE', url, options);
  }

  /**
   * 清除缓存
   */
  public invalidateCache(url?: string, params?: any): void {
    if (url) {
      this.cacheManager.invalidate('GET', url, params);
    } else {
      this.cacheManager.clear();
    }
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * 获取去重统计
   */
  public getDeduplicationStats() {
    return this.deduplicationManager.getStats();
  }

  /**
   * 获取重试配置
   */
  public getRetryConfig() {
    return this.retryManager.getConfig();
  }
}
