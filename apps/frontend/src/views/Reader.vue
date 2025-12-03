<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useWindowSize, useFullscreen } from '@vueuse/core';
  import { STORAGE_KEYS } from '../config';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import ReaderHeader from '../components/reader/ReaderHeader.vue';
  import ReaderFooter from '../components/reader/ReaderFooter.vue';
  import ReaderShortcuts from '../components/reader/ReaderShortcuts.vue';
  import SinglePageView from '../components/reader/SinglePageView.vue';
  import DoublePageView from '../components/reader/DoublePageView.vue';
  import ScrollView from '../components/reader/ScrollView.vue';
  import { ReadingMode, type Chapter } from '@read-comics/types';
  import {
    comicsService,
    chaptersService,
    imagesService,
  } from '../api/services';
  import { useSettingsStore } from '../stores/settings';

  import { handleError } from '../utils/errorHandler';
  import { logger } from '../utils/logger';

  const route = useRoute();
  const router = useRouter();
  const settingsStore = useSettingsStore();

  const {
    readingMode: storedReadingMode,
    zoomMode,
    readingDirection,
  } = storeToRefs(settingsStore);

  // 辅助函数：映射 store 模式到枚举
  const mapReadingMode = (mode: string): ReadingMode => {
    switch (mode) {
      case 'double':
        return ReadingMode.DOUBLE_PAGE;
      case 'scroll':
        return ReadingMode.CONTINUOUS_SCROLL;
      default:
        return ReadingMode.SINGLE_PAGE;
    }
  };

  // 状态管理
  const loading = ref(false);
  const currentChapter = ref<Chapter | null>(null);
  const chapters = ref<Chapter[]>([]);
  const images = ref<string[]>([]);
  const currentPage = ref(0);
  const readingMode = ref<ReadingMode>(mapReadingMode(storedReadingMode.value));
  const showControls = ref(true);
  const isScrolling = ref(false);

  // 响应式移动端检测（结合窗口大小和设备类型）
  const { width } = useWindowSize();

  // 检测设备类型
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // 组合检测：移动设备 或 窗口宽度小于 640px
  const isMobile = computed(() => isMobileDevice || width.value < 640);

  // 监听窗口大小变化，自动切换缩放模式
  watch(isMobile, (newIsMobile) => {
    if (newIsMobile && zoomMode.value !== 'fit') {
      // 进入小屏模式时，自动切换为适应屏幕
      settingsStore.updateSettings({ zoomMode: 'fit' });
    }
  });

  // 监听 store 中的 readingMode 变化
  watch(storedReadingMode, (newMode) => {
    readingMode.value = mapReadingMode(newMode);
  });

  // 计算图片样式
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

  // 切换阅读模式
  const changeReadingMode = (mode: ReadingMode) => {
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
    } else {
      // 切换到其他模式时，可能需要重置页码或其他逻辑
      // 这里保持原有的页码不变
    }
  };

  // 监听阅读模式变化
  watch(readingMode, (newMode) => {
    if (newMode === ReadingMode.CONTINUOUS_SCROLL) {
      // 切换到滚动模式时，添加滚动监听
      window.addEventListener('scroll', handleScroll);
      isScrolling.value = true;
    } else {
      // 切换到其他模式时，移除滚动监听
      window.removeEventListener('scroll', handleScroll);
      isScrolling.value = false;
    }
  });

  // 获取路由参数
  const comicId = computed(() => route.params.comicId as string);
  const chapterId = computed(() => route.params.chapterId as string);

  // 计算属性
  const totalPages = computed(() => images.value.length);
  const currentImage = computed(() => images.value[currentPage.value]);
  const progress = computed(() => {
    if (totalPages.value === 0) return 0;
    return Math.round(((currentPage.value + 1) / totalPages.value) * 100);
  });

  // 计算当前章节索引和是否有下一章
  const currentChapterIndex = computed(() => {
    if (!currentChapter.value || chapters.value.length === 0) return -1;
    return chapters.value.findIndex((ch) => ch.id === currentChapter.value!.id);
  });

  const hasNextChapter = computed(() => {
    return (
      currentChapterIndex.value >= 0 &&
      currentChapterIndex.value < chapters.value.length - 1
    );
  });

  const nextChapter = computed(() => {
    if (!hasNextChapter.value) return null;
    return chapters.value[currentChapterIndex.value + 1];
  });

  // 是否在最后一页
  const isLastPage = computed(() => {
    return currentPage.value >= totalPages.value - 1;
  });

  // 阅读模式配置
  const readingModes = [
    {
      value: ReadingMode.SINGLE_PAGE,
      label: '单页',
      icon: 'M4 6h16M4 12h16M4 18h16',
      description: '一次显示一页',
    },
    {
      value: ReadingMode.DOUBLE_PAGE,
      label: '双页',
      icon: 'M4 6h8m0 0h8M4 12h8m0 0h8M4 18h8m0 0h8',
      description: '一次显示两页',
    },
    {
      value: ReadingMode.CONTINUOUS_SCROLL,
      label: '滚动',
      icon: 'M4 6h16M4 12h16M4 18h16',
      description: '连续滚动阅读',
    },
  ];

  // 加载章节列表
  const loadChapters = async () => {
    try {
      chapters.value = await comicsService.getComicChapters(comicId.value);
    } catch (error) {
      handleError(error, 'Failed to load chapters');
    }
  };

  // 加载章节图片
  const loadChapterImages = async () => {
    loading.value = true;
    try {
      // 获取章节详情
      const chapter = await chaptersService.getChapterById(chapterId.value);
      currentChapter.value = chapter;

      // 构建图片 URL 列表
      if (chapter.pages && chapter.pages.length > 0) {
        images.value = chapter.pages.map((page: string) => {
          return imagesService.getImageUrl(chapter.imagePath, page);
        });
      } else {
        // Fallback or empty state
        images.value = [];
      }

      // 恢复阅读进度
      restoreProgress();
    } catch (error) {
      handleError(error, 'Failed to load chapter images');
    } finally {
      loading.value = false;
    }
  };

  // 保存阅读进度
  const saveProgress = () => {
    const progressData = {
      comicId: comicId.value,
      chapterId: chapterId.value,
      currentPage: currentPage.value,
      readingMode: readingMode.value,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      `${STORAGE_KEYS.READING_PROGRESS_PREFIX}${comicId.value}_${chapterId.value}`,
      JSON.stringify(progressData),
    );
  };

  // 恢复阅读进度
  const restoreProgress = () => {
    const savedProgress = localStorage.getItem(
      `${STORAGE_KEYS.READING_PROGRESS_PREFIX}${comicId.value}_${chapterId.value}`,
    );
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        currentPage.value = Math.min(
          progressData.currentPage || 0,
          totalPages.value - 1,
        );
        readingMode.value = progressData.readingMode || ReadingMode.SINGLE_PAGE;
      } catch (error) {
        logger.error('Failed to restore progress', error);
      }
    }
  };

  // 导航功能
  const goBack = () => {
    saveProgress();
    router.push(`/comic/${comicId.value}`);
  };

  const previousPage = () => {
    if (readingMode.value === ReadingMode.CONTINUOUS_SCROLL) {
      window.scrollTo({
        top: window.scrollY - window.innerHeight,
        behavior: 'smooth',
      });
    } else if (currentPage.value > 0) {
      currentPage.value--;
      saveProgress();
    }
  };

  const nextPage = () => {
    if (readingMode.value === ReadingMode.CONTINUOUS_SCROLL) {
      window.scrollTo({
        top: window.scrollY + window.innerHeight,
        behavior: 'smooth',
      });
    } else if (currentPage.value < totalPages.value - 1) {
      currentPage.value++;
      saveProgress();
    }
  };

  // 跳转到下一章
  const goToNextChapter = () => {
    if (nextChapter.value) {
      saveProgress();
      router.push(`/reader/${comicId.value}/${nextChapter.value.id}`);
    }
  };

  // 切换控制栏显示
  const toggleControls = () => {
    showControls.value = !showControls.value;
  };

  // 键盘控制
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

  // 手势控制
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

  // 滚动事件处理（用于连续滚动模式）
  const handleScroll = () => {
    if (readingMode.value !== ReadingMode.CONTINUOUS_SCROLL) return;

    const scrollPosition = window.scrollY;
    const documentHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;

    // 计算当前页码
    const newPage = Math.round(
      (scrollPosition / (documentHeight - windowHeight)) * totalPages.value,
    );

    if (
      newPage !== currentPage.value &&
      newPage >= 0 &&
      newPage < totalPages.value
    ) {
      currentPage.value = newPage;
      saveProgress();
    }
  };

  // 全屏控制
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // 监听路由变化,重新加载章节
  watch(
    () => route.params.chapterId,
    (newChapterId) => {
      if (newChapterId) {
        currentPage.value = 0;
        loadChapterImages();
      }
    },
  );

  // 生命周期钩子
  onMounted(async () => {
    await loadChapters();
    await loadChapterImages();

    // 添加键盘和触摸事件监听
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
  });

  onUnmounted(() => {
    // 移除事件监听
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('scroll', handleScroll);

    // 保存进度
    saveProgress();
  });
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white relative">
    <LoadingSpinner :show="loading" />

    <!-- 顶部导航 -->
    <ReaderHeader
      :show-controls="showControls"
      :current-page="currentPage"
      :total-pages="totalPages"
      :current-chapter="currentChapter"
      :reading-mode="readingMode"
      :reading-modes="readingModes"
      :is-fullscreen="isFullscreen"
      @go-back="goBack"
      @toggle-controls="toggleControls"
      @change-mode="changeReadingMode"
      @toggle-fullscreen="toggleFullscreen"
    />

    <!-- 主要内容区域 -->
    <main class="pt-16">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>

      <!-- 错误状态 -->
      <div
        v-else-if="!currentImage"
        class="flex items-center justify-center min-h-[80vh]"
      >
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="mt-2 text-gray-400">页面加载失败</p>
        </div>
      </div>

      <!-- 阅读区域 -->
      <div v-else class="relative">
        <!-- 单页模式 -->
        <SinglePageView
          v-if="readingMode === 'single_page'"
          :current-image="currentImage"
          :current-page="currentPage"
          :total-pages="totalPages"
          :image-style="imageStyle"
        />

        <!-- 双页模式 -->
        <DoublePageView
          v-else-if="readingMode === 'double_page'"
          :images="images"
          :current-image="currentImage"
          :current-page="currentPage"
        />

        <!-- 滚动模式 -->
        <ScrollView
          v-else
          :images="images"
          :total-pages="totalPages"
          :image-style="imageStyle"
        />

        <!-- 导航按钮 -->
        <ReaderFooter
          :current-page="currentPage"
          :total-pages="totalPages"
          :progress="progress"
          :is-last-page="isLastPage"
          :has-next-chapter="hasNextChapter"
          @previous-page="previousPage"
          @next-page="nextPage"
          @next-chapter="goToNextChapter"
        />
      </div>
    </main>

    <!-- 快捷键提示 (仅PC端显示) -->
    <ReaderShortcuts :show="showControls" :is-mobile="isMobile" />
  </div>
</template>
