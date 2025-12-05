import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

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

export class FavoritesService {
  constructor(private client: ApiClient) {}

  /**
   * 添加收藏
   */
  async addFavorite(
    comicId: string,
    status?: FavoriteStatus,
  ): Promise<Favorite> {
    return this.client.post<Favorite>(API_ENDPOINTS.favorites.base, {
      comicId,
      status: status || FavoriteStatus.READING,
    });
  }

  /**
   * 获取收藏列表（分页）
   */
  async getFavorites(params?: {
    status?: FavoriteStatus;
    page?: number;
    pageSize?: number;
  }): Promise<import('@read-comics/types').PaginatedResult<Favorite>> {
    return this.client.get<
      import('@read-comics/types').PaginatedResult<Favorite>
    >(API_ENDPOINTS.favorites.base, { params });
  }

  /**
   * 检查是否已收藏
   */
  async checkFavorite(comicId: string): Promise<Favorite | null> {
    try {
      return await this.client.get<Favorite>(
        API_ENDPOINTS.favorites.check(comicId),
      );
    } catch {
      return null;
    }
  }

  /**
   * 更新收藏状态
   */
  async updateFavorite(
    comicId: string,
    status: FavoriteStatus,
  ): Promise<Favorite> {
    return this.client.patch<Favorite>(
      API_ENDPOINTS.favorites.update(comicId),
      { status },
    );
  }

  /**
   * 取消收藏
   */
  async removeFavorite(comicId: string): Promise<void> {
    return this.client.delete(API_ENDPOINTS.favorites.remove(comicId));
  }

  /**
   * 获取收藏统计
   */
  async getStats(): Promise<FavoriteStats> {
    return this.client.get<FavoriteStats>(API_ENDPOINTS.favorites.stats);
  }
}
