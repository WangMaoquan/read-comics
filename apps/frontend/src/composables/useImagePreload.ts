import { type Ref } from 'vue';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';
import { imagesService } from '@/api/services';
import type { Chapter } from '@read-comics/types';

/**
 * 图片预加载 Composable
 * 负责预加载后续页面的图片，提升阅读流畅度
 */
export function useImagePreload(
  pages: Ref<string[]>,
  currentPage: Ref<number>,
  nextChapter?: Ref<Chapter | null | undefined>,
) {
  /**
   * 预加载图片
   */
  const preloadImages = () => {
    performanceMonitor.start('Reader:preloadImages');

    const PRELOAD_COUNT = 3; // 预加载后续 3 张
    const urls = pages.value;
    if (!urls || urls.length === 0) {
      performanceMonitor.end('Reader:preloadImages');
      return;
    }

    let preloadedCount = 0;

    // 1. 预加载本章节后续页面
    for (let i = 1; i <= PRELOAD_COUNT; i++) {
      const nextIndex = currentPage.value + i;
      if (nextIndex < urls.length) {
        const img = new Image();
        img.src = urls[nextIndex];
        preloadedCount++;
      }
    }

    // 2. 跨章节预加载 (如果快读完本章了)
    if (
      nextChapter?.value &&
      urls.length - currentPage.value <= PRELOAD_COUNT + 1
    ) {
      const nextCh = nextChapter.value;
      if (nextCh.pages && nextCh.pages.length > 0) {
        // 预加载下一章的前 2 页
        for (let i = 0; i < 2 && i < nextCh.pages.length; i++) {
          const pageUrl = imagesService.getImageUrl(
            nextCh.imagePath,
            nextCh.pages[i],
          );
          const img = new Image();
          img.src = pageUrl;
          preloadedCount++;
        }
      }
    }

    performanceMonitor.end('Reader:preloadImages');

    if (preloadedCount > 0) {
      logger.debug('Preloaded images', {
        count: preloadedCount,
        currentPage: currentPage.value,
        hasCrossChapter:
          urls.length - currentPage.value <= PRELOAD_COUNT + 1 &&
          !!nextChapter?.value,
      });
    }
  };

  return {
    preloadImages,
  };
}
