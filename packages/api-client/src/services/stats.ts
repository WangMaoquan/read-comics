import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

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

export interface TrendParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export class StatsService {
  constructor(private client: ApiClient) {}

  /**
   * 获取总览数据
   */
  async getOverview(): Promise<OverviewStats> {
    return this.client.get<OverviewStats>(API_ENDPOINTS.stats.overview);
  }

  /**
   * 获取漫画趋势
   */
  async getComicsTrend(params?: TrendParams): Promise<ChartData[]> {
    return this.client.get<ChartData[]>(API_ENDPOINTS.stats.comicsTrend, {
      params,
    });
  }

  /**
   * 获取热门漫画
   */
  async getTopComics(limit: number = 5): Promise<any[]> {
    return this.client.get<any[]>(API_ENDPOINTS.stats.topComics, {
      params: { limit },
    });
  }

  /**
   * 获取存储统计
   */
  async getStorageStats(): Promise<StorageStats> {
    return this.client.get<StorageStats>(API_ENDPOINTS.stats.storage);
  }

  /**
   * 获取用户活跃度
   */
  async getUserActivity(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    return this.client.get<any[]>(API_ENDPOINTS.stats.userActivity, { params });
  }
}
