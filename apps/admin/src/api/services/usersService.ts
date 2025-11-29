import apiClient from '../client';
import type { User, CreateUserDto, UpdateUserDto } from '@read-comics/types';

export const usersService = {
  /**
   * 获取用户列表
   */
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },

  /**
   * 获取单个用户
   */
  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * 创建用户
   */
  async createUser(data: CreateUserDto): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  /**
   * 更新用户
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },
};
