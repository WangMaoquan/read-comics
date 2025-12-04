/**
 * API 服务统一导出
 */

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
} from '../new-client';

// 重新导出类型
export {
  FavoriteStatus,
  type Favorite,
  type FavoriteStats,
} from '@read-comics/api-client';
export {
  type Tag,
  type CreateTagDto,
  type UpdateTagDto,
} from '@read-comics/api-client';
export {
  type UploadResponse,
  type ScanResult,
  type UploadProgressCallback,
  type UploadMetadata,
} from '@read-comics/api-client';

export { type UpdateProfileData } from '@read-comics/api-client';
