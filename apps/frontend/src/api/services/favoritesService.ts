import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export enum FavoriteStatus {
  READING = 'reading',
  WANT_READ = 'want_read',
  COMPLETED = 'completed',
}

export interface Favorite {
  id: string;
  comicId: string;
  status: FavoriteStatus;
  createdAt: string;
  updatedAt: string;
  comic?: any;
}

export interface FavoriteStats {
  total: number;
  reading: number;
  wantRead: number;
  completed: number;
}

export const favoritesService = {
  // 添加收藏
  async addFavorite(
    comicId: string,
    status?: FavoriteStatus,
  ): Promise<Favorite> {
    return apiClient.post<Favorite>(API_ENDPOINTS.favorites.base, {
      comicId,
      status: status || FavoriteStatus.READING,
    });
  },

  // 获取收藏列表
  async getFavorites(status?: FavoriteStatus): Promise<Favorite[]> {
    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }
    return apiClient.get<Favorite[]>(API_ENDPOINTS.favorites.base, { params });
  },

  // 检查是否已收藏
  async checkFavorite(comicId: string): Promise<Favorite | null> {
    try {
      return await apiClient.get<Favorite>(
        API_ENDPOINTS.favorites.check(comicId),
      );
    } catch {
      return null;
    }
  },

  // 更新收藏状态
  async updateFavorite(
    comicId: string,
    status: FavoriteStatus,
  ): Promise<Favorite> {
    return apiClient.patch<Favorite>(API_ENDPOINTS.favorites.update(comicId), {
      status,
    });
  },

  // 取消收藏
  async removeFavorite(comicId: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.favorites.remove(comicId));
  },

  // 获取收藏统计
  async getStats(): Promise<FavoriteStats> {
    return apiClient.get<FavoriteStats>(API_ENDPOINTS.favorites.stats);
  },
};
