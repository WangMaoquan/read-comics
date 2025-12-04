import { onMounted, onUnmounted, type Ref } from 'vue';
import { ReadingMode } from '@read-comics/types';
import { useRouter } from 'vue-router';

/**
 * 阅读器控制 Composable
 * 负责键盘和触摸控制
 */
export function useReaderControls(
  readingMode: Ref<ReadingMode>,
  currentPage: Ref<number>,
  totalPages: Ref<number>,
  comicId: Ref<string>,
  showControls: Ref<boolean>,
  previousPage: () => void,
  nextPage: () => void,
  goBack: () => void,
  changeReadingMode: (mode: ReadingMode) => void,
) {
  const router = useRouter();

  /**
   * 切换控制栏显示
   */
  const toggleControls = () => {
    showControls.value = !showControls.value;
  };

  /**
   * 键盘控制
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // 隐藏控制栏
    if (event.key === 'h' || event.key === 'H') {
      toggleControls();
      return;
    }

    // 防止在输入框中触发键盘控制
    if ((event.target as HTMLElement).tagName === 'INPUT') return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case ' ':
        event.preventDefault();
        previousPage();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case 'Enter':
        event.preventDefault();
        nextPage();
        break;
      case 'Escape':
        goBack();
        break;
      case '1':
        changeReadingMode(ReadingMode.SINGLE_PAGE);
        break;
      case '2':
        changeReadingMode(ReadingMode.DOUBLE_PAGE);
        break;
      case '3':
        changeReadingMode(ReadingMode.CONTINUOUS_SCROLL);
        break;
    }
  };

  /**
   * 手势控制
   */
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // 水平滑动距离大于垂直滑动距离，且滑动距离超过阈值
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // 向右滑动，上一页
        previousPage();
      } else {
        // 向左滑动，下一页
        nextPage();
      }
    }
  };

  /**
   * 注册事件监听
   */
  const registerEventListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
  };

  /**
   * 移除事件监听
   */
  const unregisterEventListeners = () => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  return {
    toggleControls,
    registerEventListeners,
    unregisterEventListeners,
  };
}
