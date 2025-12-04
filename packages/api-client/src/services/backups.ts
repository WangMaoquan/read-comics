import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  filePath: string;
  description?: string;
  createdAt: string;
}

export interface BackupStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  totalSize: number;
}

export interface CreateBackupDto {
  name: string;
  type: 'full' | 'incremental';
  description?: string;
}

export class BackupsService {
  constructor(private client: ApiClient) {}

  /**
   * 获取备份列表
   */
  async getBackups(): Promise<Backup[]> {
    return this.client.get<Backup[]>(API_ENDPOINTS.backups.list);
  }

  /**
   * 获取备份统计
   */
  async getStats(): Promise<BackupStats> {
    return this.client.get<BackupStats>(API_ENDPOINTS.backups.stats);
  }

  /**
   * 创建备份
   */
  async createBackup(data: CreateBackupDto): Promise<Backup> {
    return this.client.post<Backup>(API_ENDPOINTS.backups.create, data);
  }

  /**
   * 删除备份
   */
  async deleteBackup(id: string): Promise<void> {
    return this.client.delete(API_ENDPOINTS.backups.delete(id));
  }

  /**
   * 恢复备份
   */
  async restoreBackup(id: string): Promise<void> {
    return this.client.post(API_ENDPOINTS.backups.restore(id));
  }
}
