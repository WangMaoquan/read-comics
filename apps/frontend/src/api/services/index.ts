/**
 * API 服务统一导出
 */

// 使用新的 api-client 包
export { authService, comicsService } from '../new-client';
export { chaptersService } from './chaptersService';
export { filesService } from './filesService';
export { imagesService } from './imagesService';
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
