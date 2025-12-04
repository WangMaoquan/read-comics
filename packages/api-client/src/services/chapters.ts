import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';
import type { Chapter } from '@read-comics/types';

export class ChaptersService {
  constructor(private client: ApiClient) {}

  /**
   * 获取章节详情
   */
  async getChapterById(id: string): Promise<Chapter> {
    return this.client.get<Chapter>(API_ENDPOINTS.chapters.detail(id));
  }
}
