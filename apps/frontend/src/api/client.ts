import { API_BASE_URL, REQUEST_TIMEOUT } from './config';
import { STORAGE_KEYS } from '../config';
import { logger } from '../utils/logger';
import { apiCache } from '../utils/apiCache';
import { AppError, ErrorType } from '../utils/errorHandler';

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 请求选项
 */
export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean>;
  useCache?: boolean;
  cacheTTL?: number;
  skipAuth?: boolean;
}

/**
 * API 客户端类
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(
    baseURL: string = API_BASE_URL,
    timeout: number = REQUEST_TIMEOUT,
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  /**
   * 获取认证 Header
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * 构建完整 URL
   */
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }

      const message = errorData.message || response.statusText;

      // 根据状态码抛出特定类型的错误
      if (response.status === 401) {
        throw new AppError(message, ErrorType.AUTH, {
          statusCode: 401,
          data: errorData,
        });
      }
      if (response.status === 403) {
        throw new AppError(message, ErrorType.AUTH, {
          statusCode: 403,
          data: errorData,
        });
      }
      if (response.status === 404) {
        throw new AppError(message, ErrorType.NOT_FOUND, {
          statusCode: 404,
          data: errorData,
        });
      }
      if (response.status >= 500) {
        throw new AppError(message, ErrorType.SERVER, {
          statusCode: response.status,
          data: errorData,
        });
      }

      throw new AppError(message, ErrorType.UNKNOWN, {
        statusCode: response.status,
        data: errorData,
      });
    }

    // 处理 204 No Content
    if (response.status === 204) {
      return null as unknown as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      // 后端返回格式: { data: T, code, message, success }
      // 提取 data 字段
      return json.data !== undefined ? json.data : json;
    }

    return response.text() as unknown as T;
  }

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      params,
      useCache,
      cacheTTL,
      skipAuth,
      ...fetchOptions
    } = options;

    // 缓存检查 (仅 GET)
    if (useCache && fetchOptions.method === 'GET') {
      const cached = apiCache.get<T>(endpoint, params);
      if (cached) {
        logger.debug(`[API] Cache hit: ${endpoint}`, params);
        return cached;
      }
    }

    const url = this.buildURL(endpoint, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth) {
      Object.assign(headers, this.getAuthHeaders());
    }

    // 自动设置 Content-Type
    if (
      fetchOptions.body &&
      !(fetchOptions.body instanceof FormData) &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    logger.debug(`[API] Request: ${fetchOptions.method || 'GET'} ${endpoint}`, {
      params,
      body: fetchOptions.body,
    });

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      const data = await this.handleResponse<T>(response);

      // 设置缓存 (仅 GET)
      if (useCache && fetchOptions.method === 'GET') {
        apiCache.set(endpoint, data, params, cacheTTL);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('请求超时', ErrorType.NETWORK, { cause: error });
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error instanceof Error ? error.message : '网络请求失败',
        ErrorType.NETWORK,
        { cause: error as Error },
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 清除缓存
   */
  invalidateCache(endpoint: string, params?: any): void {
    apiCache.delete(endpoint, params);
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    apiCache.clear();
  }
}

// 导出默认实例
export const apiClient = new ApiClient();

export default apiClient;
