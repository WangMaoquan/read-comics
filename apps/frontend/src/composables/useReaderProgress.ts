import { ref, type Ref } from 'vue';
import { useStorage, useDebounceFn } from '@vueuse/core';
import { STORAGE_KEYS } from '@/config';
import { comicsService } from '@/api/services';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';
import type { ReadingMode } from '@read-comics/types';

/**
 * 阅读进度管理 Composable
 * 负责保存和恢复阅读进度，包括本地存储和服务器同步
 */
export function useReaderProgress(
  comicId: Ref<string>,
  chapterId: Ref<string>,
  currentPage: Ref<number>,
  totalPages: Ref<number>,
  readingMode: Ref<ReadingMode>,
) {
  // 本地存储的阅读进度
  const localProgressData = useStorage<{
    currentPage: number;
    readingMode: ReadingMode;
  } | null>(
    `${STORAGE_KEYS.READING_PROGRESS_PREFIX}${comicId.value}_${chapterId.value}`,
    null,
    undefined,
    {
      serializer: {
        read: (v) => (v ? JSON.parse(v) : null),
        write: (v) => JSON.stringify(v),
      },
    },
  );

  /**
   * 保存阅读进度（带防抖）
   */
  const saveProgress = useDebounceFn(async () => {
    if (!comicId.value || !chapterId.value) return;

    const progressData = {
      comicId: comicId.value,
      chapterId: chapterId.value,
      currentPage: currentPage.value,
      readingMode: readingMode.value,
      timestamp: new Date().toISOString(),
    };

    // 保存到本地存储
    localProgressData.value = progressData;

    // 同步到后端
    try {
      await comicsService.updateProgress(comicId.value, {
        chapterId: chapterId.value,
        currentPage: currentPage.value,
        totalPages: totalPages.value,
      });

      logger.debug('Progress saved', {
        comicId: comicId.value,
        chapterId: chapterId.value,
        currentPage: currentPage.value,
      });
    } catch (error) {
      // 静默失败，不打断用户体验
      logger.warn('Failed to sync progress to server', error);
    }
  }, 500);

  /**
   * 恢复阅读进度
   */
  const restoreProgress = async (
    setCurrentPage: (page: number) => void,
  ): Promise<void> => {
    return performanceMonitor.measure('Reader:restoreProgress', async () => {
      // 1. 尝试从本地存储恢复
      if (localProgressData.value) {
        try {
          const page = Math.min(
            localProgressData.value.currentPage || 0,
            totalPages.value - 1,
          );
          setCurrentPage(page);
          readingMode.value =
            localProgressData.value.readingMode || readingMode.value;

          logger.debug('Progress restored from local storage', {
            page,
            readingMode: readingMode.value,
          });
          return;
        } catch (error) {
          logger.error('Failed to restore progress from localStorage', error);
        }
      }

      // 2. 如果本地没有，尝试从服务器获取
      try {
        const progress = await comicsService.getChapterProgress(
          comicId.value,
          chapterId.value,
        );
        if (progress) {
          const page = Math.min(progress.currentPage, totalPages.value - 1);
          setCurrentPage(page);
          logger.debug('Progress restored from server', { page });
        } else {
          // 3. 如果都没有，默认为 0
          setCurrentPage(0);
        }
      } catch (error) {
        // 忽略错误，默认为 0
        setCurrentPage(0);
      }
    });
  };

  return {
    localProgressData,
    saveProgress,
    restoreProgress,
  };
}
