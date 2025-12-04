<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useWindowSize, useFullscreen } from '@vueuse/core';
  import LoadingSpinner from '@components/LoadingSpinner.vue';
  import ReaderHeader from '@components/reader/ReaderHeader.vue';
  import ReaderFooter from '@components/reader/ReaderFooter.vue';
  import ReaderShortcuts from '@components/reader/ReaderShortcuts.vue';
  import SinglePageView from '@components/reader/SinglePageView.vue';
  import DoublePageView from '@components/reader/DoublePageView.vue';
  import ScrollView from '@components/reader/ScrollView.vue';
  import { ReadingMode } from '@read-comics/types';
  import { comicsService } from '../api/services';
  import { useSettingsStore } from '../stores/settings';
  import { useReaderStore } from '../stores/reader';
  import { handleError } from '../utils/errorHandler';
  import { logger } from '../utils/logger';
  import { performanceMonitor } from '../utils/performance';
  import { isMobileDevice } from '@/utils/reader';

  // Composables
  import { useReaderProgress } from '@/composables/useReaderProgress';
  import { useImagePreload } from '@/composables/useImagePreload';
  import { useReadingMode } from '@/composables/useReadingMode';
  import { useReaderControls } from '@/composables/useReaderControls';

  const route = useRoute();
  const router = useRouter();
  const settingsStore = useSettingsStore();
  const readerStore = useReaderStore();

  // 获取路由参数
  const comicId = ref(route.params.comicId as string);
  const chapterId = ref(route.params.chapterId as string);

  const { readingMode: storedReadingMode, zoomMode } =
    storeToRefs(settingsStore);

  // 从 reader store 获取状态
  const {
    currentChapter,
    pageUrls: pages,
    currentPage,
    loading,
    totalPages,
    getNextChapter,
  } = storeToRefs(readerStore);

  // 状态管理
  const showControls = ref(true);

  // 全屏控制
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // 响应式移动端检测
  const { width } = useWindowSize();
  const isMobile = computed(() => isMobileDevice || width.value < 640);

  // 监听窗口大小变化，自动切换缩放模式
  watch(isMobile, (newIsMobile) => {
    if (newIsMobile && zoomMode.value !== 'fit') {
      settingsStore.updateSettings({ zoomMode: 'fit' });
    }
  });

  // 使用阅读模式 composable
  const {
    readingMode,
    isScrolling,
    imageStyle,
    changeReadingMode: _changeReadingMode,
    handleScroll: _handleScroll,
  } = useReadingMode(
    storedReadingMode,
    zoomMode,
    isMobile,
    currentPage,
    totalPages,
  );

  // 使用阅读进度 composable
  const { saveProgress, restoreProgress } = useReaderProgress(
    comicId,
    chapterId,
    currentPage,
    totalPages,
    readingMode,
  );

  // 使用图片预加载 composable
  const { preloadImages } = useImagePreload(pages, currentPage);

  // 监听当前页变化，触发预加载
  watch(currentPage, () => {
    preloadImages();
  });

  // 计算属性
  const currentImage = computed(() => pages.value[currentPage.value]);
  const progress = computed(() => {
    if (totalPages.value === 0) return 0;
    return Math.round(((currentPage.value + 1) / totalPages.value) * 100);
  });

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

  // 页面刷新会丢失 store 状态, 所以需要重新请求
  const enSureChapterExist = async () => {
    try {
      const chapters = await comicsService.getComicChapters(comicId.value);
      const chapter = chapters.find((ch) => ch.id === chapterId.value)!;
      readerStore.setState(chapter);
    } catch (error) {
      handleError(error, 'Failed to load chapters');
    }
  };

  // 加载章节图片
  const loadChapterImages = async () => {
    return performanceMonitor.measure(
      'Reader:loadChapter',
      async () => {
        readerStore.setLoading(true);
        try {
          let chapter = readerStore.currentChapter;
          if (!chapter) {
            await enSureChapterExist();
            chapter = readerStore.currentChapter!;
          }

          await restoreProgress(readerStore.setCurrentPage);

          logger.info('Chapter loaded successfully', {
            chapterId: chapterId.value,
            totalPages: totalPages.value,
          });
        } catch (error) {
          handleError(error, 'Failed to load chapter images');
        } finally {
          readerStore.setLoading(false);
        }
      },
      { chapterId: chapterId.value },
    );
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
      readerStore.previousPage();
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
      readerStore.nextPage();
      saveProgress();
    }
  };

  const goToNextChapter = () => {
    if (getNextChapter.value) {
      saveProgress();
      const id = getNextChapter.value.id;
      readerStore.setState(getNextChapter.value);
      router.push(`/reader/${comicId.value}/${id}`);
    }
  };

  // 包装 changeReadingMode 以传递 saveProgress
  const changeReadingMode = (mode: ReadingMode) => {
    _changeReadingMode(mode, saveProgress);
  };

  // 包装 handleScroll
  const handleScroll = () => {
    _handleScroll(readerStore.setCurrentPage, saveProgress);
  };

  // 使用阅读器控制 composable
  const { toggleControls, registerEventListeners, unregisterEventListeners } =
    useReaderControls(
      readingMode,
      currentPage,
      totalPages,
      comicId,
      showControls,
      previousPage,
      nextPage,
      goBack,
      changeReadingMode,
    );

  // 监听路由变化更新 ID
  watch(
    () => route.params,
    (newParams) => {
      if (newParams.comicId) {
        comicId.value = newParams.comicId as string;
      }
      if (newParams.chapterId) {
        chapterId.value = newParams.chapterId as string;
      }
    },
    { immediate: true },
  );

  // 监听阅读模式变化，添加/移除滚动监听
  watch(isScrolling, (scrolling) => {
    if (scrolling) {
      window.addEventListener('scroll', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
    }
  });

  // 监听路由变化,重新加载章节
  watch(
    () => route.params.chapterId,
    (newChapterId) => {
      if (newChapterId) {
        loadChapterImages();
      }
    },
  );

  // 生命周期钩子
  onMounted(async () => {
    await loadChapterImages();
    registerEventListeners();
  });

  onUnmounted(() => {
    unregisterEventListeners();
    window.removeEventListener('scroll', handleScroll);
    saveProgress();
  });
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white relative">
    <LoadingSpinner v-show="loading" />

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
          :images="pages"
          :current-image="currentImage"
          :current-page="currentPage"
        />

        <!-- 滚动模式 -->
        <ScrollView
          v-else
          :images="pages"
          :total-pages="totalPages"
          :image-style="imageStyle"
        />

        <!-- 导航按钮 -->
        <ReaderFooter
          :current-page="currentPage"
          :total-pages="totalPages"
          :progress="progress"
          :is-last-page="isLastPage"
          :has-next-chapter="!!readerStore.getNextChapter"
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
