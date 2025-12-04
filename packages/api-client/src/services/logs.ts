import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

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

export interface LogsResponse {
  data: SystemLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class LogsService {
  constructor(private client: ApiClient) {}

  /**
   * 获取日志列表
   */
  async getLogs(params: LogsQueryParams): Promise<LogsResponse> {
    return this.client.get<LogsResponse>(API_ENDPOINTS.logs.list, { params });
  }

  /**
   * 获取日志统计
   */
  async getStats(): Promise<LogStats> {
    return this.client.get<LogStats>(API_ENDPOINTS.logs.stats);
  }

  /**
   * 清空日志
   */
  async clearLogs(): Promise<void> {
    return this.client.delete(API_ENDPOINTS.logs.clear);
  }
}
