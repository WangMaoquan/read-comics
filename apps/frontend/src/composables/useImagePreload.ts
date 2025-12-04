import { type Ref } from 'vue';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';

/**
 * 图片预加载 Composable
 * 负责预加载后续页面的图片，提升阅读流畅度
 */
export function useImagePreload(
  pages: Ref<string[]>,
  currentPage: Ref<number>,
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
    for (let i = 1; i <= PRELOAD_COUNT; i++) {
      const nextIndex = currentPage.value + i;
      if (nextIndex < urls.length) {
        const img = new Image();
        img.src = urls[nextIndex];
        preloadedCount++;
      }
    }

    performanceMonitor.end('Reader:preloadImages');

    if (preloadedCount > 0) {
      logger.debug('Preloaded images', {
        count: preloadedCount,
        currentPage: currentPage.value,
      });
    }
  };

  return {
    preloadImages,
  };
}
