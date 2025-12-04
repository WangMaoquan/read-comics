import { createApi } from '@read-comics/api-client';
import router from '@/router';
import { STORAGE_KEYS } from '@/config';
import { useStorage } from '@vueuse/core';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';

// 从环境变量获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = createApi({
  baseURL: API_BASE_URL,
  getToken: () => {
    return useStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, '').value;
  },
  onUnauthorized: () => {
    logger.warn('Unauthorized access, redirecting to login');

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

// 添加性能监控拦截器
api.client.instance.interceptors.request.use(
  (config) => {
    const metricName = `API:${config.method?.toUpperCase()}:${config.url}`;
    performanceMonitor.start(metricName, {
      method: config.method,
      url: config.url,
    });
    // 将 metric name 存储在 config 中，以便在响应拦截器中使用
    (config as any)._metricName = metricName;
    return config;
  },
  (error) => Promise.reject(error),
);

api.client.instance.interceptors.response.use(
  (response) => {
    const metricName = (response.config as any)._metricName;
    if (metricName) {
      performanceMonitor.end(metricName);
    }
    return response;
  },
  (error) => {
    const metricName = (error.config as any)?._metricName;
    if (metricName) {
      performanceMonitor.end(metricName);
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
