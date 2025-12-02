import apiClient from '../client';

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

export const backupsService = {
  // 获取备份列表
  getBackups() {
    return apiClient.get<Backup[]>('/backups');
  },

  // 获取备份统计
  getStats() {
    return apiClient.get<BackupStats>('/backups/stats');
  },

  // 创建备份
  createBackup(data: {
    name: string;
    type: 'full' | 'incremental';
    description?: string;
  }) {
    return apiClient.post<Backup>('/backups', data);
  },

  // 删除备份
  deleteBackup(id: string) {
    return apiClient.delete(`/backups/${id}`);
  },

  // 恢复备份 (模拟)
  restoreBackup(id: string) {
    return apiClient.post(`/backups/${id}/restore`);
  },
};
