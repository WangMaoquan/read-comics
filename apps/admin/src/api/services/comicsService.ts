import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type { Comic } from '@read-comics/types';

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
  async getComic(id: string): Promise<Comic> {
    return apiClient.get<Comic>(API_ENDPOINTS.comics.detail(id));
  },
};
