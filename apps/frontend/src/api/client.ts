import { createApi } from '@read-comics/api-client';
import router from '@/router';
import { STORAGE_KEYS } from '@/config';
import { useStorage } from '@vueuse/core';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';
import { toast } from '@/composables/useToast';

// 从环境变量获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 从错误响应中提取错误消息
 */
function getErrorMessage(error: any): string {
  // 优先使用后端返回的错误消息
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // 根据 HTTP 状态码返回默认消息
  const status = error.response?.status;
  switch (status) {
    case 400:
      return '请求参数错误';
    case 401:
      return '登录已过期，请重新登录';
    case 403:
      return '没有权限执行此操作';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器错误，请稍后重试';
    case 502:
    case 503:
    case 504:
      return '服务暂时不可用，请稍后重试';
    default:
      // 网络错误
      if (!error.response) {
        return '网络连接失败，请检查网络';
      }
      return error.message || '操作失败，请重试';
  }
}

export const api = createApi({
  baseURL: API_BASE_URL,
  getToken: () => {
    return useStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, '').value;
  },
  onUnauthorized: (error) => {
    // 检查是否是认证相关接口
    const isAuthRequest = error?.config?.url?.includes('/auth');

    if (isAuthRequest) {
      // 认证接口的 401: 不处理,让 onError 显示错误
      return;
    }

    // 其他接口的 401: 显示提示并跳转
    toast.error('登录已过期，请重新登录');

    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 跳转到登录页
    router.push('/login');
  },
  onError: (error) => {
    logger.error('API Error', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
    });

    // 401 处理逻辑:
    // 1. 认证接口(登录/注册等)的 401: 在这里显示 specific 错误消息 (onUnauthorized 会跳过)
    // 2. 其他接口的 401: onUnauthorized 会处理(显示"登录已过期"并跳转), 这里跳过
    // 3. 非 401 错误: 在这里显示通用错误消息

    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/forgot-password') ||
        error.config?.url?.includes('/auth/reset-password');

      if (isAuthRequest) {
        // 认证接口的 401: 显示具体错误消息
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
      // 非认证接口的 401: onUnauthorized 已处理, 这里的 onError 忽略
    } else {
      // 非 401 错误: 显示错误消息
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  },
  // 启用缓存（默认 5 分钟）
  cache: {
    ttl: 5 * 60 * 1000,
    maxSize: 100,
  },
  // 启用重试（默认 3 次）
  retry: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
});

// 使用 WeakMap 存储请求的 metric name，避免污染 config 对象
const requestMetrics = new WeakMap<any, string>();

// 添加性能监控拦截器
api.client.instance.interceptors.request.use(
  (config) => {
    const metricName = `API:${config.method?.toUpperCase()}:${config.url}`;
    performanceMonitor.start(metricName, {
      method: config.method,
      url: config.url,
    });
    // 使用 WeakMap 存储 metric name
    requestMetrics.set(config, metricName);
    return config;
  },
  (error) => Promise.reject(error),
);

api.client.instance.interceptors.response.use(
  (response) => {
    const metricName = requestMetrics.get(response.config);
    if (metricName) {
      performanceMonitor.end(metricName);
      requestMetrics.delete(response.config);
    }
    return response;
  },
  (error) => {
    const metricName = error.config ? requestMetrics.get(error.config) : null;
    if (metricName) {
      performanceMonitor.end(metricName);
      if (error.config) {
        requestMetrics.delete(error.config);
      }
    }
    return Promise.reject(error);
  },
);

export const {
  auth: authService,
  comics: comicsService,
  chapters: chaptersService,
  tags: tagsService,
  favorites: favoritesService,
  files: filesService,
  images: imagesService,
  users: usersService,
} = api;
