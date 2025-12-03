/**
 * API 服务统一导出
 */

export { comicsService } from './comicsService';
export { chaptersService } from './chaptersService';
export { filesService } from './filesService';
export { imagesService } from './imagesService';
// 使用新的 api-client 包
export { authService } from '../new-client';
export {
  favoritesService,
  FavoriteStatus,
  type Favorite,
  type FavoriteStats,
} from './favoritesService';
export {
  tagsService,
  type Tag,
  type CreateTagDto,
  type UpdateTagDto,
} from './tagsService';
export { usersService, type UpdateProfileData } from './usersService';
