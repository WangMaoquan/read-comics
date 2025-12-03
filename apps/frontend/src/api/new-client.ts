import { createApi } from '@read-comics/api-client';
import router from '@/router';

// 从环境变量获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = createApi({
  baseURL: API_BASE_URL,
  getToken: () => {
    return localStorage.getItem('token');
  },
  onUnauthorized: () => {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 跳转到登录页
    router.push('/login');
  },
  onError: (error) => {
    console.error('API Error:', error);
  },
});

export const { auth: authService, comics: comicsService } = api;
