import { createApi } from '@read-comics/api-client';
import { API_BASE_URL } from './config';

/**
 * 创建 API 客户端实例
 */
export const api = createApi({
  baseURL: API_BASE_URL,
  // 获取 token 的方法
  getToken: () => localStorage.getItem('admin_token'),
  // 处理 401 未授权
  onUnauthorized: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  },
  // 处理其他错误
  onError: (error) => {
    console.error('API Error:', error);
  },
});

// 导出各个服务
export const {
  auth: authService,
  comics: comicsService,
  chapters: chaptersService,
  tags: tagsService,
  favorites: favoritesService,
  files: filesService,
  images: imagesService,
  users: usersService,
  stats: statsService,
  logs: logsService,
  tasks: tasksService,
  backups: backupsService,
} = api;
