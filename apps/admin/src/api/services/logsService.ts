import apiClient from '../client';

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  userId?: string;
  username?: string;
  ip?: string;
  metadata?: any;
  createdAt: string;
}

export interface LogStats {
  total: number;
  info: number;
  warn: number;
  error: number;
  debug: number;
}

export interface LogsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  level?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}

export const logsService = {
  // 获取日志列表
  getLogs(params: LogsQueryParams) {
    return apiClient.get<{
      data: SystemLog[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/logs', { params });
  },

  // 获取日志统计
  getStats() {
    return apiClient.get<LogStats>('/logs/stats');
  },

  // 清空日志
  clearLogs() {
    return apiClient.delete('/logs');
  },
};
