import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
  readCount?: number; // 阅读次数（该标签下所有漫画的阅读记录总数）
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export const tagsService = {
  // 获取所有标签
  async getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>(API_ENDPOINTS.tags.base);
  },

  // 获取标签详情
  async getTag(id: string): Promise<Tag> {
    return apiClient.get<Tag>(API_ENDPOINTS.tags.detail(id));
  },

  // 创建标签（需要管理员权限）
  async createTag(data: CreateTagDto): Promise<Tag> {
    return apiClient.post<Tag>(API_ENDPOINTS.tags.base, data);
  },

  // 更新标签（需要管理员权限）
  async updateTag(id: string, data: UpdateTagDto): Promise<Tag> {
    return apiClient.patch<Tag>(API_ENDPOINTS.tags.update(id), data);
  },

  // 删除标签（需要管理员权限）
  async deleteTag(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.tags.delete(id));
  },

  // 获取标签下的漫画
  async getComicsByTag(tagId: string): Promise<any[]> {
    return apiClient.get<any[]>(API_ENDPOINTS.tags.comics(tagId));
  },

  // 为漫画添加标签（需要管理员权限）
  async addTagToComic(comicId: string, tagId: string): Promise<any> {
    return apiClient.post(API_ENDPOINTS.tags.addToComic(comicId, tagId));
  },

  // 从漫画移除标签（需要管理员权限）
  async removeTagFromComic(comicId: string, tagId: string): Promise<any> {
    return apiClient.delete(API_ENDPOINTS.tags.removeFromComic(comicId, tagId));
  },
};
