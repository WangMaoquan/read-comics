// 使用新的 api-client 包
export {
  authService,
  comicsService,
  chaptersService,
  tagsService,
  favoritesService,
  filesService,
  imagesService,
  usersService,
  statsService,
  logsService,
  tasksService,
  backupsService,
} from '../client';

// 重新导出类型
export {
  type OverviewStats,
  type ChartData,
  type StorageStats,
  type TrendParams,
} from '@read-comics/api-client';

export {
  type SystemLog,
  type LogStats,
  type LogsQueryParams,
  type LogsResponse,
} from '@read-comics/api-client';

export {
  type Task,
  type TaskStats,
  type CreateTaskDto,
} from '@read-comics/api-client';

export {
  type Backup,
  type BackupStats,
  type CreateBackupDto,
} from '@read-comics/api-client';
