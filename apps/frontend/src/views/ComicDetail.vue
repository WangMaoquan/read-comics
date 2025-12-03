<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import LoadingSpinner from '@components/LoadingSpinner.vue';
  import type { Comic, Chapter, ReadingProgress } from '@read-comics/types';
  import { ComicStatus, ComicFormat } from '@read-comics/types';
  import { useComicStore } from '../stores/comic';
  import { comicsService } from '../api/services';

  import { handleError } from '../utils/errorHandler';

  const route = useRoute();
  const router = useRouter();
  const comicStore = useComicStore();

  // 状态管理
  const loading = computed(() => comicStore.loading);
  const loadingChapters = ref(false);
  const comic = computed(() => comicStore.currentComic);
  const chapters = computed(() => comicStore.chapters);
  const currentChapter = ref<Chapter | null>(null);
  const readingProgress = ref<ReadingProgress | null>(null);

  // 获取漫画ID
  const comicId = computed(() => route.params.id as string);

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (!comic.value) return;
    try {
      const updatedComic = await comicsService.toggleFavorite(comic.value.id);
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
    } catch (error) {
      handleError(error, 'Failed to toggle favorite');
    }
  };

  // 加载漫画详情
  const loadComicDetails = async () => {
    try {
      await comicStore.fetchComicById(comicId.value);
    } catch (error) {
      handleError(error, 'Failed to load comic details');
    }
  };

  // 加载阅读进度
  const loadProgress = async () => {
    try {
      const progress = await comicsService.getProgress(comicId.value);
      readingProgress.value = progress;

      // 如果有进度，设置当前章节
      if (progress && chapters.value.length > 0) {
        const chapter = chapters.value.find(
          (ch) => ch.id === progress.chapterId,
        );
        if (chapter) {
          currentChapter.value = chapter;
        }
      }
    } catch (error) {
      // 忽略 404 错误（未开始阅读）
      // console.log('No reading progress found', error);
    }
  };

  // 加载章节列表
  const loadChapters = async () => {
    loadingChapters.value = true;
    try {
      await comicStore.fetchChapters(comicId.value);

      // 设置默认章节（第一章）
      if (chapters.value.length > 0 && !currentChapter.value) {
        currentChapter.value = chapters.value[0];
      }
    } catch (error) {
      handleError(error, 'Failed to load chapters');
    } finally {
      loadingChapters.value = false;
    }
  };

  // 判断章节是否已读
  const isChapterRead = (chapter: Chapter): boolean => {
    if (!readingProgress.value) return false;

    // 找到当前阅读进度的章节
    const currentProgressChapter = chapters.value.find(
      (ch) => ch.id === readingProgress.value!.chapterId,
    );

    if (!currentProgressChapter) return false;

    // 如果章节页码小于当前进度章节页码，则为已读
    if (chapter.pageNumber < currentProgressChapter.pageNumber) return true;

    // 如果是当前章节，且进度为100%，也算已读
    if (
      chapter.id === readingProgress.value.chapterId &&
      readingProgress.value.progress === 100
    )
      return true;

    return false;
  };

  // 导航功能
  const goBack = () => {
    router.push('/library');
  };

  // 开始阅读
  const startReading = () => {
    if (chapters.value.length > 0) {
      // 如果有阅读记录，从记录处开始
      if (readingProgress.value) {
        readChapter(readingProgress.value.chapterId);
      } else {
        // 否则从第一章开始
        const firstChapter = chapters.value[0];
        if (firstChapter) {
          readChapter(firstChapter.id);
        }
      }
    }
  };

  // 阅读指定章节
  const readChapter = (chapterId: string) => {
    const chapter = chapters.value.find((ch) => ch.id === chapterId);
    if (chapter) {
      currentChapter.value = chapter;
      router.push(`/reader/${comicId.value}/${chapterId}`);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 处理图片加载错误
  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = '/placeholder.png';
    }
  };

  // 初始化
  onMounted(async () => {
    await loadComicDetails();
    await loadChapters();
    await loadProgress();
  });
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 页面标题栏 -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- 返回按钮 -->
          <button
            @click="goBack"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              class="w-5 h-5"
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
            <span class="text-sm font-medium">返回</span>
          </button>

          <!-- 页面标题 -->
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            漫画详情
          </h1>

          <!-- 右侧占位，保持标题居中或左对齐 -->
          <div class="w-20"></div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="loading && !comic" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>

      <!-- 漫画未找到 -->
      <div v-else-if="!comic && !loading" class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          未找到漫画
        </h2>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          返回书库
        </button>
      </div>

      <!-- 漫画详情内容 -->
      <div v-else-if="comic" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：封面和信息 -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <!-- 封面 -->
            <div
              class="aspect-2/3 w-full rounded-lg overflow-hidden shadow-lg relative group"
            >
              <img
                :src="`http://localhost:4399/images/thumbnail?comicPath=${encodeURIComponent(comic.filePath)}&imagePath=${encodeURIComponent(comic.cover || '')}`"
                :alt="comic.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"
              ></div>
            </div>

            <!-- 基本信息 -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4"
            >
              <div>
                <h2
                  class="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {{ comic.title }}
                </h2>
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ comic.author || '未知作者' }}
                </p>
              </div>

              <div class="space-y-2 text-sm">
                <div
                  class="flex justify-between text-gray-600 dark:text-gray-300"
                >
                  <span>状态</span>
                  <span
                    :class="{
                      'text-green-600': comic.status === ComicStatus.READING,
                      'text-blue-600': comic.status === ComicStatus.COMPLETED,
                      'text-gray-600': comic.status === ComicStatus.UNREAD,
                    }"
                  >
                    {{
                      comic.status === ComicStatus.READING
                        ? '阅读中'
                        : comic.status === ComicStatus.COMPLETED
                          ? '已读完'
                          : '未读'
                    }}
                  </span>
                </div>
                <div
                  class="flex justify-between text-gray-600 dark:text-gray-300"
                >
                  <span>格式</span>
                  <span class="uppercase">{{ comic.fileFormat }}</span>
                </div>
                <div
                  class="flex justify-between text-gray-600 dark:text-gray-300"
                >
                  <span>大小</span>
                  <span>{{ formatFileSize(comic.fileSize) }}</span>
                </div>
                <div
                  class="flex justify-between text-gray-600 dark:text-gray-300"
                >
                  <span>页数</span>
                  <span>{{ comic.totalPages }} 页</span>
                </div>
                <div
                  class="flex justify-between text-gray-600 dark:text-gray-300"
                >
                  <span>添加时间</span>
                  <span>{{ formatDate(comic.createdAt) }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div
                class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  @click="startReading"
                  class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg gap-2"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>开始阅读</span>
                </button>
                <button
                  @click="toggleFavorite"
                  class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md gap-2"
                >
                  <svg
                    class="w-5 h-5 transition-colors duration-300"
                    :class="{ 'fill-red-500 text-red-500': comic.isFavorite }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{{ comic.isFavorite ? '移出书架' : '加入书架' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：章节列表 -->
        <div class="lg:col-span-2">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="p-6">
              <!-- 章节列表标题 -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  章节列表
                </h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  共 {{ chapters.length }} 章节
                </span>
              </div>

              <!-- 加载章节状态 -->
              <div v-if="loadingChapters" class="text-center py-8">
                <LoadingSpinner text="加载章节中..." />
              </div>

              <!-- 章节列表为空 -->
              <div v-else-if="chapters.length === 0" class="text-center py-8">
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
                <p class="mt-2 text-gray-500 dark:text-gray-400">暂无章节</p>
              </div>

              <!-- 章节列表内容 -->
              <div v-else class="space-y-2">
                <div
                  v-for="chapter in chapters"
                  :key="chapter.id"
                  @click="readChapter(chapter.id)"
                  :class="[
                    'flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200',
                    isChapterRead(chapter)
                      ? 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800',
                  ]"
                >
                  <!-- 章节信息 -->
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-medium text-gray-900 dark:text-white truncate"
                      :class="[
                        isChapterRead(chapter)
                          ? ''
                          : 'text-blue-700 dark:text-blue-300',
                      ]"
                    >
                      {{ chapter.title }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      更新于: {{ formatDate(chapter.updatedAt) }}
                    </p>
                  </div>

                  <!-- 右侧信息 -->
                  <div class="flex items-center space-x-4">
                    <!-- 已读状态 -->
                    <span
                      class="text-sm font-medium"
                      :class="[
                        isChapterRead(chapter)
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-blue-600 dark:text-blue-400',
                      ]"
                    >
                      {{ isChapterRead(chapter) ? '已读' : '未读' }}
                    </span>

                    <!-- 章节编号 -->
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      第 {{ chapter.pageNumber }} 话
                    </span>

                    <!-- 箭头图标 -->
                    <svg
                      class="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
