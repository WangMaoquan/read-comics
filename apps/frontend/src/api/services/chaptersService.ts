import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Chapter } from '@read-comics/types';

/**
 * 章节服务
 */
export const chaptersService = {
  /**
   * 获取章节详情
   */
  async getChapterById(id: string): Promise<Chapter> {
    return apiClient.get<Chapter>(API_ENDPOINTS.chapters.detail(id));
  },
};
