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
  async getComics(): Promise<Comic[]> {
    return apiClient.get<Comic[]>(API_ENDPOINTS.comics.list);
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
};
