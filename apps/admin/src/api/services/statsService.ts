import apiClient from '../client';

export interface OverviewStats {
  totalComics: number;
  totalUsers: number;
  newComicsThisWeek: number;
  activeUsers: number;
  totalReads: number;
  storageUsed: string;
}

export interface ChartData {
  date: string;
  count: number;
}

export interface StorageStats {
  totalSize: number;
  count: number;
  avgSize: number;
  distribution: { name: string; value: number }[];
}

export const statsService = {
  // 获取总览数据
  getOverview() {
    return apiClient.get<OverviewStats>('/stats/overview');
  },

  // 获取漫画趋势
  getComicsTrend(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }) {
    return apiClient.get<ChartData[]>('/stats/comics-trend', { params });
  },

  // 获取热门漫画
  getTopComics(limit: number = 5) {
    return apiClient.get<any[]>('/stats/top-comics', { params: { limit } });
  },

  // 获取存储统计
  getStorageStats() {
    return apiClient.get<StorageStats>('/stats/storage');
  },

  // 获取用户活跃度
  getUserActivity(params?: { startDate?: string; endDate?: string }) {
    return apiClient.get<any[]>('/stats/user-activity', { params });
  },
};
