import { API_BASE_URL, REQUEST_TIMEOUT } from './config';

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
    const token = localStorage.getItem('auth_token');
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
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * 带超时的 fetch
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`,
      );
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
   * GET 请求
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildURL(endpoint);

    const isFormData = data instanceof FormData;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: isFormData
          ? { ...this.getAuthHeaders() }
          : {
              'Content-Type': 'application/json',
              ...this.getAuthHeaders(),
              ...fetchOptions.headers,
            },
        body: isFormData ? data : JSON.stringify(data),
        ...fetchOptions,
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildURL(endpoint);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
        body: JSON.stringify(data),
        ...fetchOptions,
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildURL(endpoint);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
        body: JSON.stringify(data),
        ...fetchOptions,
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildURL(endpoint);

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }
}

// 导出默认实例
export const apiClient = new ApiClient();

export default apiClient;
