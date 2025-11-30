import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Comic, Chapter, ReadingProgress } from '@read-comics/types';

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

  /**
   * 更新阅读进度
   */
  async updateProgress(
    comicId: string,
    data: { chapterId: string; currentPage: number; totalPages: number },
  ): Promise<ReadingProgress> {
    return apiClient.post<ReadingProgress>(
      API_ENDPOINTS.comics.progress(comicId),
      data,
    );
  },

  /**
   * 获取阅读进度
   */
  async getProgress(comicId: string): Promise<ReadingProgress> {
    return apiClient.get<ReadingProgress>(
      API_ENDPOINTS.comics.progress(comicId),
    );
  },
};
