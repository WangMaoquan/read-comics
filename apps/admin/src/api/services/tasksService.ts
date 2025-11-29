import apiClient from '../client';

export interface Task {
  id: string;
  name: string;
  type: 'scan' | 'thumbnail' | 'backup' | 'cleanup' | 'import';
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

export const tasksService = {
  // 获取任务列表
  getTasks() {
    return apiClient.get<Task[]>('/tasks');
  },

  // 获取任务统计
  getStats() {
    return apiClient.get<TaskStats>('/tasks/stats');
  },

  // 创建任务
  createTask(data: { name: string; type: string; params?: any }) {
    return apiClient.post<Task>('/tasks', data);
  },

  // 取消任务
  cancelTask(id: string) {
    return apiClient.post(`/tasks/${id}/cancel`);
  },

  // 重试任务
  retryTask(id: string) {
    return apiClient.post(`/tasks/${id}/retry`);
  },

  // 删除任务
  deleteTask(id: string) {
    return apiClient.delete(`/tasks/${id}`);
  },

  // 清除已完成任务
  clearCompleted() {
    return apiClient.delete('/tasks/completed');
  },
};
