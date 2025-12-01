/**
 * API 服务统一导出
 */

export { comicsService } from './comicsService';
export { chaptersService } from './chaptersService';
export { filesService } from './filesService';
export { imagesService } from './imagesService';
export { authService } from './authService';
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
