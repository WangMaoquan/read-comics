import { comicsService } from '@/api/services';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { useComicStore } from '@/stores';
import type { Comic } from '@read-comics/types';

/**
 * 收藏功能 Composable
 * 可在多个组件中复用的收藏切换逻辑
 */
export function useFavorite() {
  const comicStore = useComicStore();

  /**
   * 切换收藏状态
   */
  const toggleFavorite = async (comic: Comic): Promise<Comic | null> => {
    if (!comic) {
      logger.warn('toggleFavorite called with null comic');
      return null;
    }

    try {
      const updatedComic = await comicsService.toggleFavorite(comic.id);

      // 更新 store 中的当前漫画
      comicStore.$patch({ currentComic: updatedComic });

      // 如果在列表中也存在，更新列表
      const index = comicStore.comics.findIndex(
        (c) => c.id === updatedComic.id,
      );
      if (index !== -1) {
        const newComics = [...comicStore.comics];
        newComics[index] = updatedComic;
        comicStore.$patch({ comics: newComics });
      }

      logger.info('Favorite toggled', {
        comicId: comic.id,
        isFavorite: updatedComic.isFavorite,
      });

      return updatedComic;
    } catch (error) {
      handleError(error, 'Failed to toggle favorite');
      return null;
    }
  };

  return {
    toggleFavorite,
  };
}
