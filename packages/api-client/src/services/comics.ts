import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';
import type {
  Comic,
  Chapter,
  ReadingProgress,
  PaginatedResult,
} from '@read-comics/types';

export interface GetComicsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isFavorite?: boolean;
  search?: string;
}

export interface UpdateProgressDto {
  chapterId: string;
  currentPage: number;
  totalPages: number;
}

export class ComicsService {
  constructor(private client: ApiClient) {}

  /**
   * 获取漫画列表（分页）
   */
  async getComics(params?: GetComicsParams): Promise<PaginatedResult<Comic>> {
    return this.client.get<PaginatedResult<Comic>>(API_ENDPOINTS.comics.list, {
      params,
    });
  }

  /**
   * 搜索漫画（分页）
   */
  async searchComics(
    query: string,
    params?: Omit<GetComicsParams, 'search'>,
  ): Promise<PaginatedResult<Comic>> {
    return this.client.get<PaginatedResult<Comic>>(API_ENDPOINTS.comics.list, {
      params: { ...params, search: query },
    });
  }

  /**
   * 获取漫画详情
   */
  async getComicById(id: string): Promise<Comic> {
    return this.client.get<Comic>(API_ENDPOINTS.comics.detail(id));
  }

  /**
   * 获取漫画的章节列表
   */
  async getComicChapters(comicId: string): Promise<Chapter[]> {
    return this.client.get<Chapter[]>(API_ENDPOINTS.comics.chapters(comicId));
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(id: string): Promise<Comic> {
    return this.client.post<Comic>(API_ENDPOINTS.comics.toggleFavorite(id));
  }

  /**
   * 更新阅读进度
   */
  async updateProgress(
    comicId: string,
    data: UpdateProgressDto,
  ): Promise<ReadingProgress> {
    return this.client.post<ReadingProgress>(
      API_ENDPOINTS.comics.progress(comicId),
      data,
    );
  }

  /**
   * 获取阅读进度
   */
  async getProgress(comicId: string): Promise<ReadingProgress> {
    return this.client.get<ReadingProgress>(
      API_ENDPOINTS.comics.progress(comicId),
    );
  }

  /**
   * 获取指定章节阅读进度
   */
  async getChapterProgress(
    comicId: string,
    chapterId: string,
  ): Promise<ReadingProgress> {
    return this.client.get<ReadingProgress>(
      API_ENDPOINTS.comics.progressChapter(comicId, chapterId),
    );
  }

  /**
   * 合并重复漫画
   */
  async mergeDuplicates(
    keepId: string,
    deleteIds: string[],
  ): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>(
      API_ENDPOINTS.comics.mergeDuplicates,
      {
        keepId,
        deleteIds,
      },
    );
  }

  /**
   * 归档漫画
   */
  async archive(id: string): Promise<{ success: boolean; message: string }> {
    return this.client.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.comics.archive(id),
    );
  }
}
