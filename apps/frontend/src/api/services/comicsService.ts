import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Comic, Chapter } from '@read-comics/types';

/**
 * 漫画服务
 */
export const comicsService = {
  /**
   * 获取漫画列表
   */
  async getComics(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    isFavorite?: boolean,
  ): Promise<Comic[]> {
    const params: Record<string, string | boolean> = {};
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }
    if (isFavorite !== undefined) {
      params.isFavorite = isFavorite;
    }
    return apiClient.get<Comic[]>(API_ENDPOINTS.comics.list, { params });
  },

  /**
   * 获取漫画详情
   */
  async getComicById(id: string): Promise<Comic> {
    return apiClient.get<Comic>(API_ENDPOINTS.comics.detail(id));
  },

  /**
   * 获取漫画的章节列表
   */
  async getComicChapters(comicId: string): Promise<Chapter[]> {
    return apiClient.get<Chapter[]>(API_ENDPOINTS.comics.chapters(comicId));
  },

  /**
   * 搜索漫画
   */
  async searchComics(
    query: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    isFavorite?: boolean,
  ): Promise<Comic[]> {
    const params: Record<string, string | boolean> = { search: query };
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }
    if (isFavorite !== undefined) {
      params.isFavorite = isFavorite;
    }
    return apiClient.get<Comic[]>(API_ENDPOINTS.comics.list, { params });
  },

  /**
   * 切换收藏状态
   */
  async toggleFavorite(id: string): Promise<Comic> {
    return apiClient.post<Comic>(`${API_ENDPOINTS.comics.detail(id)}/favorite`);
  },
};
