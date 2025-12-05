import { ref, type Ref } from 'vue';
import { comicsService } from '@/api/services';
import { handleError } from '@/utils/errorHandler';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';
import { useComicStore } from '@/stores';
import type { Chapter, ReadingProgress } from '@read-comics/types';

/**
 * 漫画详情管理 Composable
 * 负责加载漫画详情、章节列表和阅读进度
 */
export function useComicDetail(comicId: Ref<string>) {
  const comicStore = useComicStore();

  const loadingChapters = ref(false);
  const currentChapter = ref<Chapter | null>(null);
  const readingProgress = ref<ReadingProgress | null>(null);

  /**
   * 加载漫画详情
   */
  const loadComicDetails = async () => {
    return performanceMonitor.measure('ComicDetail:loadDetails', async () => {
      try {
        await comicStore.fetchComicById(comicId.value);

        // 从漫画详情中获取阅读进度（取最近的一条）
        const comic = comicStore.currentComic;
        if (comic?.readingProgress && comic.readingProgress.length > 0) {
          readingProgress.value = comic.readingProgress[0];
        }

        logger.debug('Comic details loaded', {
          comicId: comicId.value,
          hasProgress: !!readingProgress.value,
        });
      } catch (error) {
        handleError(error, 'Failed to load comic details');
        throw error;
      }
    });
  };

  /**
   * 加载章节列表
   */
  const loadChapters = async () => {
    loadingChapters.value = true;
    try {
      await comicStore.fetchChapters(comicId.value);

      // 设置默认章节（第一章）
      const chapters = comicStore.chapters;
      if (chapters.length > 0 && !currentChapter.value) {
        currentChapter.value = chapters[0];
      }

      logger.debug('Chapters loaded', {
        comicId: comicId.value,
        count: chapters.length,
      });
    } catch (error) {
      handleError(error, 'Failed to load chapters');
      throw error;
    } finally {
      loadingChapters.value = false;
    }
  };

  /**
   * 加载阅读进度
   */
  const loadProgress = async () => {
    try {
      const chapters = comicStore.chapters;
      // 如果有进度，设置当前章节
      if (readingProgress.value && chapters.length > 0) {
        const chapter = chapters.find(
          (ch) => ch.id === readingProgress.value!.chapterId,
        );
        if (chapter) {
          currentChapter.value = chapter;
        }
      }
    } catch (error) {
      // 忽略错误
      logger.warn('Failed to load progress', error);
    }
  };

  /**
   * 判断章节是否已读
   */
  const isChapterRead = (chapter: Chapter): boolean => {
    if (!chapter.readingProgress) return false;
    return chapter.readingProgress.isReadComplete;
  };

  return {
    loadingChapters,
    currentChapter,
    readingProgress,
    loadComicDetails,
    loadChapters,
    loadProgress,
    isChapterRead,
  };
}
