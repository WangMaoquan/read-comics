import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

export interface Task {
  id: string;
  name: string;
  type:
    | 'scan'
    | 'thumbnail'
    | 'backup'
    | 'cleanup'
    | 'import'
    | 'deduplicate'
    | 'fetch-metadata'
    | 'prepare-assets';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
  result?: any;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  running: number;
  pending: number;
  completed: number;
  failed: number;
}

export interface CreateTaskDto {
  name: string;
  type: string;
  params?: any;
}

export class TasksService {
  constructor(private client: ApiClient) {}

  /**
   * 获取任务列表
   */
  async getTasks(): Promise<Task[]> {
    return this.client.get<Task[]>(API_ENDPOINTS.tasks.list);
  }

  /**
   * 获取任务统计
   */
  async getStats(): Promise<TaskStats> {
    return this.client.get<TaskStats>(API_ENDPOINTS.tasks.stats);
  }

  /**
   * 创建任务
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.client.post<Task>(API_ENDPOINTS.tasks.create, data);
  }

  /**
   * 取消任务
   */
  async cancelTask(id: string): Promise<void> {
    return this.client.post(API_ENDPOINTS.tasks.cancel(id));
  }

  /**
   * 重试任务
   */
  async retryTask(id: string): Promise<void> {
    return this.client.post(API_ENDPOINTS.tasks.retry(id));
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<void> {
    return this.client.delete(API_ENDPOINTS.tasks.delete(id));
  }

  /**
   * 清除已完成任务
   */
  async clearCompleted(): Promise<void> {
    return this.client.delete(API_ENDPOINTS.tasks.clearCompleted);
  }
}
