<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import { ReadingMode, type Chapter } from '@read-comics/types';

  const route = useRoute();
  const router = useRouter();

  // 状态管理
  const loading = ref(false);
  const currentChapter = ref<Chapter | null>(null);
  const chapters = ref<Chapter[]>([]);
  const images = ref<string[]>([]);
  const currentPage = ref(0);
  const readingMode = ref<ReadingMode>(ReadingMode.SINGLE_PAGE);
  const showControls = ref(true);
  const isScrolling = ref(false);

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
      const response = await fetch(
        `http://localhost:4399/comics/${comicId.value}/chapters`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      chapters.value = await response.json();
    } catch (error) {
      console.error('Failed to load chapters:', error);
    }
  };

  // 加载章节图片
  const loadChapterImages = async () => {
    loading.value = true;
    try {
      // 获取章节详情
      const response = await fetch(
        `http://localhost:4399/chapters/${chapterId.value}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chapter details');
      }

      const chapter = await response.json();
      currentChapter.value = chapter;

      // 构建图片 URL 列表
      if (chapter.pages && chapter.pages.length > 0) {
        images.value = chapter.pages.map((page: string) => {
          return `http://localhost:4399/images/view?comicPath=${encodeURIComponent(
            chapter.imagePath,
          )}&imagePath=${encodeURIComponent(page)}`;
        });
      } else {
        // Fallback or empty state
        images.value = [];
      }

      // 恢复阅读进度
      restoreProgress();
    } catch (error) {
      console.error('Failed to load chapter images:', error);
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
      `reading_progress_${comicId.value}_${chapterId.value}`,
      JSON.stringify(progressData),
    );
  };

  // 恢复阅读进度
  const restoreProgress = () => {
    const savedProgress = localStorage.getItem(
      `reading_progress_${comicId.value}_${chapterId.value}`,
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
        console.error('Failed to restore progress:', error);
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

  // 切换阅读模式
  const changeReadingMode = (mode: ReadingMode) => {
    readingMode.value = mode;
    saveProgress();

    // 如果切换到滚动模式，滚动到当前位置
    if (mode === ReadingMode.CONTINUOUS_SCROLL) {
      const scrollPosition =
        (currentPage.value / totalPages.value) * document.body.scrollHeight;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
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
  <div class="min-h-screen bg-gray-900" @click="showControls = true">
    <!-- 页面标题栏 -->
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 transition-all duration-300',
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- 左侧：返回按钮 -->
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="text-gray-300 hover:text-white transition-colors"
              title="返回"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- 章节信息 -->
            <div class="text-white">
              <div class="text-sm text-gray-400">
                {{ currentChapter?.title }}
              </div>
              <div class="font-medium">
                {{ currentPage + 1 }} / {{ totalPages }}
              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="flex items-center space-x-2">
            <!-- 阅读模式切换 -->
            <div class="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <button
                v-for="mode in readingModes"
                :key="mode.value"
                @click="changeReadingMode(mode.value)"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  readingMode === mode.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white',
                ]"
                :title="mode.description"
              >
                {{ mode.label }}
              </button>
            </div>

            <!-- 设置按钮 -->
            <button
              @click="toggleControls"
              class="text-gray-300 hover:text-white transition-colors"
              title="设置"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

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
        <div
          v-if="readingMode === 'single_page'"
          class="flex items-center justify-center min-h-[80vh] p-4"
        >
          <div class="relative">
            <img
              :src="currentImage"
              :alt="`Page ${currentPage + 1}`"
              class="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg"
              loading="lazy"
            />
            <!-- 页码显示 -->
            <div
              class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
            >
              {{ currentPage + 1 }} / {{ totalPages }}
            </div>
          </div>
        </div>

        <!-- 双页模式 -->
        <div
          v-else-if="readingMode === 'double_page'"
          class="flex items-center justify-center min-h-[80vh] p-4 space-x-2"
        >
          <template v-if="currentPage > 0">
            <div class="relative">
              <img
                :src="images[currentPage - 1]"
                :alt="`Page ${currentPage}`"
                class="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg"
                loading="lazy"
              />
              <div
                class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
              >
                {{ currentPage }}
              </div>
            </div>
          </template>

          <div class="relative">
            <img
              :src="currentImage"
              :alt="`Page ${currentPage + 1}`"
              class="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg"
              loading="lazy"
            />
            <div
              class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
            >
              {{ currentPage + 1 }}
            </div>
          </div>
        </div>

        <!-- 滚动模式 -->
        <div v-else class="relative">
          <div class="max-w-4xl mx-auto p-4 space-y-8">
            <div v-for="(image, index) in images" :key="index" class="relative">
              <img
                :src="image"
                :alt="`Page ${index + 1}`"
                class="w-full object-contain shadow-lg rounded-lg mx-auto"
                loading="lazy"
              />
              <div
                class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
              >
                {{ index + 1 }} / {{ totalPages }}
              </div>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div
          class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
              <button
                @click="previousPage"
                :disabled="currentPage === 0"
                class="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>上一页</span>
              </button>

              <div class="flex items-center space-x-4">
                <!-- 进度条 -->
                <div class="flex-1 max-w-xs">
                  <div class="w-full bg-gray-600 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${progress}%` }"
                    />
                  </div>
                </div>
                <!-- 进度百分比 -->
                <span class="text-gray-300 text-sm">{{ progress }}%</span>
              </div>

              <!-- 下一页或下一章按钮 -->
              <button
                v-if="!isLastPage"
                @click="nextPage"
                class="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                <span>下一页</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                v-else-if="hasNextChapter"
                @click="goToNextChapter"
                class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-md hover:shadow-lg"
              >
                <span>下一章: {{ nextChapter?.title }}</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                v-else
                @click="goBack"
                class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors shadow-md hover:shadow-lg"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>已读完</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 快捷键提示 -->
    <div
      v-if="showControls"
      class="fixed top-20 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 z-40"
    >
      <div class="font-medium mb-2">快捷键:</div>
      <div class="space-y-1 text-xs">
        <div>←/→ 或 空格/Enter: 翻页</div>
        <div>↑/↓: 翻页</div>
        <div>1/2/3: 切换阅读模式</div>
        <div>H: 隐藏控制栏</div>
        <div>ESC: 返回</div>
      </div>
    </div>
  </div>
</template>
