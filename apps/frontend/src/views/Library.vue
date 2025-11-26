<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import type { Comic } from '@read-comics/types';
  import { ComicStatus } from '@read-comics/types';
  import { useFileStore } from '../stores/files';
  import { useComicStore } from '../stores/comic';

  const router = useRouter();
  const fileStore = useFileStore();
  const comicStore = useComicStore();

  // 状态管理
  const loading = ref(false);
  const comics = computed(() => comicStore.comics);
  const viewMode = ref<'grid' | 'list'>('grid');
  const searchQuery = ref('');
  const sortBy = ref<'title' | 'date' | 'progress'>('date');

  // 过滤和排序
  const filteredComics = computed(() => {
    let result = [...comics.value];

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      result = result.filter(
        (comic) =>
          comic.title.toLowerCase().includes(query) ||
          comic.author?.toLowerCase().includes(query) ||
          comic.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy.value) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'progress':
          return (
            (b.status === 'completed' ? 100 : b.lastReadAt ? 50 : 0) -
            (a.status === 'completed' ? 100 : a.lastReadAt ? 50 : 0)
          );
        default:
          return 0;
      }
    });

    return result;
  });

  // 加载数据
  const loadComics = async () => {
    loading.value = true;
    try {
      await comicStore.fetchComics();
    } finally {
      loading.value = false;
    }
  };

  // 导航到漫画详情
  const goToComicDetail = (comicId: number) => {
    router.push(`/comic/${comicId}`);
  };

  // 导入漫画
  const importComics = async () => {
    await fileStore.importComics();
  };

  // 初始化
  onMounted(() => {
    loadComics();
  });
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
    <!-- 页面标题和操作栏 -->
    <div
      class="sticky top-16 z-30 glass border-b border-white/20 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <!-- 标题 -->
          <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-gradient">漫画库</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              共 {{ comics.length }} 部漫画
            </p>
          </div>

          <!-- 操作按钮 -->
          <div
            class="flex items-center gap-3 animate-fade-in"
            style="animation-delay: 0.1s"
          >
            <!-- 导入按钮 -->
            <button
              @click="importComics"
              :disabled="
                fileStore.status === 'scanning' ||
                fileStore.status === 'importing'
              "
              class="btn btn-primary text-sm px-4 py-2 hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="
                  fileStore.status === 'idle' ||
                  fileStore.status === 'completed' ||
                  fileStore.status === 'error'
                "
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <LoadingSpinner v-else size="sm" class="mr-2" />
              {{
                fileStore.status === 'scanning'
                  ? '扫描中...'
                  : fileStore.status === 'importing'
                    ? '导入中...'
                    : '导入漫画'
              }}
            </button>

            <!-- 视图切换 -->
            <div
              class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-inner"
            >
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-md transition-all duration-200',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                ]"
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-md transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                ]"
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 导入进度条 -->
        <div v-if="fileStore.status !== 'idle'" class="mt-4 animate-fade-in">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600 dark:text-gray-300">
              {{
                fileStore.status === 'scanning'
                  ? '正在扫描文件...'
                  : fileStore.status === 'completed'
                    ? '导入完成'
                    : `正在导入: ${fileStore.current}/${fileStore.total}`
              }}
            </span>
            <span class="text-gray-500 dark:text-gray-400">
              {{
                fileStore.status === 'completed'
                  ? '100%'
                  : fileStore.total > 0
                    ? Math.round((fileStore.current / fileStore.total) * 100) +
                      '%'
                    : '...'
              }}
            </span>
          </div>
          <div
            class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden"
          >
            <div
              class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              :style="{
                width:
                  fileStore.status === 'completed'
                    ? '100%'
                    : fileStore.total > 0
                      ? `${(fileStore.current / fileStore.total) * 100}%`
                      : '0%',
              }"
            ></div>
          </div>
          <div
            v-if="fileStore.logs.length > 0"
            class="mt-2 text-xs text-gray-500 dark:text-gray-400 max-h-20 overflow-y-auto font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded"
          >
            <div v-for="(log, index) in fileStore.logs.slice(-5)" :key="index">
              {{ log }}
            </div>
          </div>
          <div
            v-if="
              fileStore.status === 'completed' || fileStore.status === 'error'
            "
            class="mt-2 text-right"
          >
            <button
              @click="fileStore.resetStatus()"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              关闭
            </button>
          </div>
        </div>

        <!-- 搜索和过滤栏 -->
        <div
          class="mt-6 flex flex-col sm:flex-row gap-4 animate-fade-in"
          style="animation-delay: 0.2s"
        >
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <div class="relative group">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索漫画标题、作者或标签..."
                class="block w-full pl-10 pr-3 py-2.5 border-0 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:shadow-lg transition-all duration-300"
                style="box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)"
                onfocus="this.style.boxShadow='0 0 0 2px rgba(102, 126, 234, 0.3), 0 0 25px rgba(102, 126, 234, 0.4), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'"
                onblur="this.style.boxShadow='0 1px 2px 0 rgb(0 0 0 / 0.05)'"
              />
            </div>
          </div>

          <!-- 排序选择 -->
          <div class="relative">
            <select
              v-model="sortBy"
              class="block w-full sm:w-48 pl-3 pr-10 py-2 border-0 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="date">按添加时间排序</option>
              <option value="title">按标题排序</option>
              <option value="progress">按阅读进度排序</option>
            </select>
            <div
              class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
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

      <!-- 空状态 -->
      <div
        v-else-if="comics.length === 0"
        class="text-center py-20 animate-fade-in"
      >
        <div
          class="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 class="mt-2 text-xl font-medium text-gray-900 dark:text-white">
          暂无漫画
        </h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          点击"导入漫画"开始添加您的漫画收藏
        </p>
      </div>

      <!-- 漫画网格视图 -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <div
          v-for="(comic, index) in filteredComics"
          :key="comic.id"
          @click="goToComicDetail(Number(comic.id))"
          class="card-glass group cursor-pointer overflow-hidden hover-lift animate-scale-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <!-- 封面图片 -->
          <div
            class="aspect-w-3 aspect-h-4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
          >
            <img
              :src="comic.coverPath || '/placeholder-cover.jpg'"
              :alt="comic.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <!-- 遮罩层 -->
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <!-- 进度条 -->
            <div
              v-if="comic.lastReadAt"
              class="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/30 backdrop-blur-sm"
            >
              <div
                class="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                :style="{
                  width: `${comic.status === 'completed' ? 100 : comic.lastReadAt ? 50 : 0}%`,
                }"
              />
            </div>
          </div>

          <!-- 漫画信息 -->
          <div class="p-4">
            <h3
              class="font-bold text-gray-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ comic.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
              {{ comic.author }}
            </p>
            <div class="flex items-center justify-between">
              <span
                class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {{ comic.totalPages }} 页
              </span>
              <span
                v-if="comic.lastReadAt"
                class="text-xs font-bold"
                :class="[
                  comic.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400',
                ]"
              >
                {{
                  comic.status === 'completed'
                    ? 100
                    : comic.lastReadAt
                      ? 50
                      : 0
                }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 漫画列表视图 -->
      <div v-else class="space-y-4">
        <div
          v-for="(comic, index) in filteredComics"
          :key="comic.id"
          @click="goToComicDetail(Number(comic.id))"
          class="card-glass p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-slide-up flex items-center gap-4"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <!-- 封面图片 -->
          <div
            class="shrink-0 w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm"
          >
            <img
              :src="comic.coverPath || '/placeholder-cover.jpg'"
              :alt="comic.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <!-- 漫画信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3
                class="text-lg font-bold text-gray-900 dark:text-white truncate"
              >
                {{ comic.title }}
              </h3>
              <span
                v-if="comic.lastReadAt"
                class="text-sm font-bold"
                :class="[
                  comic.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400',
                ]"
              >
                {{
                  comic.status === 'completed'
                    ? 100
                    : comic.lastReadAt
                      ? 50
                      : 0
                }}%
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {{ comic.author }} · {{ comic.totalPages }} 页
            </p>
            <div
              v-if="comic.tags && comic.tags.length > 0"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="tag in comic.tags.slice(0, 3)"
                :key="tag"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="shrink-0">
            <button
              @click.stop="goToComicDetail(Number(comic.id))"
              class="btn btn-primary text-sm px-4 py-2"
            >
              开始阅读
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
