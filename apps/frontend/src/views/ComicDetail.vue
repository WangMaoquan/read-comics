<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import type { Comic, Chapter } from '@read-comics/types';
  import { ComicStatus, ComicFormat } from '@read-comics/types';

  const route = useRoute();
  const router = useRouter();

  // 状态管理
  const loading = ref(false);
  const loadingChapters = ref(false);
  const comic = ref<Comic | null>(null);
  const chapters = ref<Chapter[]>([]);
  const currentChapter = ref<Chapter | null>(null);

  // 获取漫画ID
  const comicId = computed(() => route.params.id as string);

  // 计算属性
  const comicProgress = computed(() => {
    if (!comic.value || !currentChapter.value) return 0;

    // 简单的进度计算：已读章节数 / 总章节数
    const readChapters = chapters.value.filter(
      (ch) => ch.id <= currentChapter.value!.id,
    ).length;
    return Math.round((readChapters / chapters.value.length) * 100);
  });

  // 模拟加载漫画详情
  const loadComicDetails = async () => {
    loading.value = true;
    try {
      // TODO: 从API加载漫画详情
      await new Promise((resolve) => setTimeout(resolve, 1000));

      comic.value = {
        id: comicId.value,
        title: '进击的巨人',
        author: '谏山创',
        description:
          '人类与巨人的生存之战，讲述了一个少年在巨人威胁下为自由而战的故事。',
        coverPath: '/covers/attack-on-titan.jpg',
        filePath: '/comics/attack-on-titan',
        fileSize: 1000000000,
        fileFormat: ComicFormat.FOLDER,
        totalPages: 139,
        status: ComicStatus.READING,
        tags: ['热血', '战斗', '奇幻', '生存'],
        rating: 9.5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastReadAt: new Date('2024-01-15'),
      };
    } catch (error) {
      console.error('Failed to load comic details:', error);
    } finally {
      loading.value = false;
    }
  };

  // 模拟加载章节列表
  const loadChapters = async () => {
    loadingChapters.value = true;
    try {
      // TODO: 从API加载章节列表
      await new Promise((resolve) => setTimeout(resolve, 500));

      chapters.value = Array.from({ length: 20 }, (_, i) => ({
        id: (i + 1).toString(),
        comicId: comicId.value,
        title: `第 ${i + 1} 话 - ${getChapterTitle(i + 1)}`,
        pageNumber: i + 1,
        imagePath: `/comics/attack-on-titan/chapter-${i + 1}`,
        createdAt: new Date(
          `2023-${String(i + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        ),
        updatedAt: new Date(
          `2024-${String(i + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        ),
      }));

      // 设置当前章节为第一个未读章节或最后一章
      const firstUnreadChapter = chapters.value.find(
        (ch) => !isChapterRead(ch),
      );
      currentChapter.value =
        firstUnreadChapter || chapters.value[chapters.value.length - 1];
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      loadingChapters.value = false;
    }
  };

  // 获取章节标题
  const getChapterTitle = (chapterNumber: number): string => {
    const titles = [
      '绝望的呐喊',
      '希望之门',
      '誓言',
      '巨人来袭',
      '小刀',
      '正义',
      '回应',
      '听见心跳',
      '士兵',
      '回应',
      '少女',
      '枪声',
      '巨人',
      '路',
      '墙外',
      '独白',
      '正确答案',
      '两副面孔',
      '父亲',
      '女巨人',
    ];
    return titles[chapterNumber - 1] || `第 ${chapterNumber} 话`;
  };

  // 判断章节是否已读
  const isChapterRead = (chapter: Chapter): boolean => {
    // 简单的已读判断：章节ID小于等于当前章节ID
    return parseInt(chapter.id) <= parseInt(currentChapter.value?.id || '0');
  };

  // 导航功能
  const goBack = () => {
    router.push('/library');
  };

  // 开始阅读
  const startReading = () => {
    if (chapters.value.length > 0) {
      const firstChapter = chapters.value[0];
      if (firstChapter) {
        readChapter(firstChapter.id);
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
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 初始化
  onMounted(async () => {
    await loadComicDetails();
    await loadChapters();
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

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-2">
            <button
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 010-5.684m-9.032 5.684a9.001 9.001 0 0118.064 0"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>

      <!-- 漫画未找到 -->
      <div v-else-if="!comic" class="text-center py-12">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          漫画未找到
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          请检查链接或返回漫画库
        </p>
        <button
          @click="goBack"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          返回漫画库
        </button>
      </div>

      <!-- 漫画详情内容 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：漫画封面和信息 -->
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- 封面图片 -->
            <div
              class="aspect-w-3 aspect-h-4 bg-gray-200 dark:bg-gray-700 relative"
            >
              <img
                :src="comic.coverPath || '/placeholder-cover.jpg'"
                :alt="comic.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <!-- 进度条 -->
              <div
                v-if="comicProgress > 0"
                class="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-600"
              >
                <div
                  class="h-full bg-blue-600 transition-all duration-300"
                  :style="{ width: `${comicProgress}%` }"
                />
              </div>
            </div>

            <!-- 漫画信息 -->
            <div class="p-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {{ comic.title }}
              </h2>

              <!-- 基本信息 -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">作者:</span>
                  <span class="text-gray-900 dark:text-white font-medium">{{
                    comic.author || '未知'
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">状态:</span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="[
                      comic.status === ComicStatus.COMPLETED
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    ]"
                  >
                    {{
                      comic.status === ComicStatus.COMPLETED
                        ? '已完结'
                        : '连载中'
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">页数:</span>
                  <span class="text-gray-900 dark:text-white font-medium"
                    >{{ comic.totalPages }} 页</span
                  >
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400"
                    >文件大小:</span
                  >
                  <span class="text-gray-900 dark:text-white font-medium">{{
                    formatFileSize(comic.fileSize)
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400"
                    >更新时间:</span
                  >
                  <span class="text-gray-900 dark:text-white font-medium">{{
                    formatDate(comic.updatedAt)
                  }}</span>
                </div>
                <div
                  v-if="comic.rating"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-gray-500 dark:text-gray-400">评分:</span>
                  <span
                    class="text-yellow-600 dark:text-yellow-400 font-medium"
                  >
                    {{ comic.rating }}/10
                  </span>
                </div>
              </div>

              <!-- 标签 -->
              <div v-if="comic.tags && comic.tags.length > 0" class="mb-6">
                <h4
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  标签:
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in comic.tags"
                    :key="tag"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="space-y-3">
                <button
                  @click="startReading"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <svg
                    class="w-4 h-4 mr-2"
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
                  开始阅读
                </button>
                <button
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    class="w-4 h-4 mr-2"
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
                  添加到收藏
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
                      ? 'bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      第 {{ parseInt(chapter.id) }} 话
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
