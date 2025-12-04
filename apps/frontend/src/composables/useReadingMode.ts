import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import { ReadingMode } from '@read-comics/types';
import { useSettingsStore } from '@/stores/settings';

/**
 * 阅读模式管理 Composable
 * 负责阅读模式切换、图片样式计算、滚动模式处理
 */
export function useReadingMode(
  storedReadingMode: Ref<'single' | 'double' | 'scroll'>,
  zoomMode: Ref<'fit' | 'width' | 'original'>,
  isMobile: ComputedRef<boolean>,
  currentPage: Ref<number>,
  totalPages: Ref<number>,
) {
  const settingsStore = useSettingsStore();
  const isScrolling = ref(false);

  // 映射存储的阅读模式到 ReadingMode 枚举
  const mapReadingMode = (
    mode: 'single' | 'double' | 'scroll',
  ): ReadingMode => {
    switch (mode) {
      case 'double':
        return ReadingMode.DOUBLE_PAGE;
      case 'scroll':
        return ReadingMode.CONTINUOUS_SCROLL;
      default:
        return ReadingMode.SINGLE_PAGE;
    }
  };

  const readingMode = ref<ReadingMode>(mapReadingMode(storedReadingMode.value));

  // 监听 store 中的 readingMode 变化
  watch(storedReadingMode, (newMode) => {
    readingMode.value = mapReadingMode(newMode);
  });

  /**
   * 计算图片样式
   */
  const imageStyle = computed(() => {
    const style: Record<string, string> = {};

    // 小屏幕下强制使用适应屏幕模式
    const effectiveZoomMode = isMobile.value ? 'fit' : zoomMode.value;

    // 缩放模式
    if (readingMode.value !== ReadingMode.CONTINUOUS_SCROLL) {
      if (effectiveZoomMode === 'fit') {
        style.maxHeight = '100vh';
        style.maxWidth = '100vw';
        style.objectFit = 'contain';
      } else if (effectiveZoomMode === 'width') {
        style.width = '100%';
        style.height = 'auto';
      } else {
        style.width = 'auto';
        style.height = 'auto';
      }
    } else {
      // 滚动模式下通常宽度自适应
      if (effectiveZoomMode === 'fit' || effectiveZoomMode === 'width') {
        style.width = '100%';
        style.height = 'auto';
      } else {
        style.width = 'auto';
        style.height = 'auto';
        style.maxWidth = 'none';
      }
    }

    return style;
  });

  /**
   * 切换阅读模式
   */
  const changeReadingMode = (mode: ReadingMode, saveProgress: () => void) => {
    readingMode.value = mode;
    saveProgress();

    // 更新 store
    let storeMode: 'single' | 'double' | 'scroll' = 'single';
    if (mode === ReadingMode.DOUBLE_PAGE) storeMode = 'double';
    if (mode === ReadingMode.CONTINUOUS_SCROLL) storeMode = 'scroll';
    settingsStore.updateSettings({ readingMode: storeMode });

    // 如果切换到滚动模式，滚动到当前阅读位置
    if (mode === ReadingMode.CONTINUOUS_SCROLL) {
      setTimeout(() => {
        const scrollPosition =
          (currentPage.value / totalPages.value) * document.body.scrollHeight;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }, 100); // 延迟一下确保 DOM 已更新
    }
  };

  /**
   * 滚动事件处理（用于连续滚动模式）
   */
  const handleScroll = (
    setCurrentPage: (page: number) => void,
    saveProgress: () => void,
  ) => {
    if (readingMode.value !== ReadingMode.CONTINUOUS_SCROLL) return;

    const scrollPosition = window.scrollY;
    const documentHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;

    // 计算当前页码
    const newPage = Math.round(
      (scrollPosition / (documentHeight - windowHeight)) * totalPages.value,
    );

    if (
      currentPage.value !== newPage &&
      newPage >= 0 &&
      newPage < totalPages.value
    ) {
      setCurrentPage(newPage);
      saveProgress();
    }
  };

  // 监听阅读模式变化
  watch(readingMode, (newMode) => {
    if (newMode === ReadingMode.CONTINUOUS_SCROLL) {
      isScrolling.value = true;
    } else {
      isScrolling.value = false;
    }
  });

  return {
    readingMode,
    isScrolling,
    imageStyle,
    changeReadingMode,
    handleScroll,
  };
}
