<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { refDebounced } from '@vueuse/core';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import type { Comic } from '@read-comics/types';

  import { useComicStore } from '../stores/comic';
  import { comicsService } from '../api/services';
  import { validateFile } from '../utils/formatValidation';
  import UploadModal from '../components/library/UploadModal.vue';
  import ComicCard from '../components/library/ComicCard.vue';
  import ComicListItem from '../components/library/ComicListItem.vue';
  import { toast } from '../composables/useToast';
  import { handleError } from '../utils/errorHandler';

  const router = useRouter();
  const comicStore = useComicStore();

  // 状态管理
  const loading = ref(false);
  const comics = computed(() => comicStore.comics);
  const viewMode = ref<'grid' | 'list'>('grid');
  const searchQuery = ref('');
  // 使用防抖，延迟 300ms
  const debouncedSearchQuery = refDebounced(searchQuery, 300);
  const sortBy = ref<'title' | 'date' | 'progress'>('date');

  // 过滤和排序
  const filteredComics = computed(() => {
    // 现在搜索和排序都由后端处理
    // 这里只需要返回 store 中的漫画列表
    return comics.value;
  });

  // 加载数据
  const loadComics = async (search?: string, sort?: string) => {
    loading.value = true;
    try {
      // 将前端排序选项映射到后端字段
      const sortMapping: Record<string, string> = {
        title: 'title',
        date: 'createdAt',
        progress: 'lastReadAt',
      };
      const backendSortBy = sort ? sortMapping[sort] : sortMapping['date'];
      const sortOrder: 'asc' | 'desc' = sort === 'title' ? 'asc' : 'desc';

      if (search && search.trim()) {
        // 如果有搜索词，调用搜索 API
        const searchResults = await comicsService.searchComics(
          search,
          backendSortBy,
          sortOrder,
        );
        // 直接更新 store 的 comics
        comicStore.$patch({ comics: searchResults });
      } else {
        // 否则加载所有漫画，支持排序
        const allComics = await comicsService.getComics(
          backendSortBy,
          sortOrder,
        );
        comicStore.$patch({ comics: allComics });
      }
    } catch (error) {
      handleError(error, 'Failed to load comics');
    } finally {
      loading.value = false;
    }
  };

  // 监听防抖后的搜索词变化
  watch(debouncedSearchQuery, (newQuery) => {
    loadComics(newQuery, sortBy.value);
  });

  // 监听排序变化
  watch(sortBy, (newSort) => {
    loadComics(debouncedSearchQuery.value, newSort);
  });

  // 导航到漫画详情
  const goToComicDetail = (comicId: string) => {
    router.push(`/comic/${comicId}`);
  };

  // 切换收藏状态
  const toggleFavorite = async (comic: Comic) => {
    try {
      const updatedComic = await comicsService.toggleFavorite(comic.id);
      // 更新本地状态
      const index = comicStore.comics.findIndex((c) => c.id === comic.id);
      if (index !== -1) {
        // 使用 patch 更新单个漫画
        const newComics = [...comicStore.comics];
        newComics[index] = updatedComic;
        comicStore.$patch({ comics: newComics });
      }
    } catch (error) {
      handleError(error, 'Failed to toggle favorite');
    }
  };

  // 文件上传相关
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const showUploadModal = ref(false);
  const currentUploadFile = ref<File | null>(null);

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.value?.click();
  };

  // 处理文件选择
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    // 使用统一的文件验证工具
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || '文件验证失败');
      target.value = '';
      return;
    }

    currentUploadFile.value = file;
    showUploadModal.value = true;

    // 重置 input，以便下次可以选择相同文件
    target.value = '';
  };

  const onUploadSuccess = async () => {
    await loadComics();
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
            <!-- 隐藏的文件输入 -->
            <input
              ref="fileInputRef"
              type="file"
              accept=".cbz,.zip"
              @change="handleFileSelect"
              class="hidden"
            />

            <!-- 上传文件按钮 -->
            <button
              @click="triggerFileUpload"
              class="btn btn-primary text-sm px-4 py-2 hover-glow"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              上传漫画
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

          <!-- 右侧控制区 -->
          <div class="flex items-center gap-4">
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
    </div>

    <!-- 上传模态框 -->
    <UploadModal
      v-model="showUploadModal"
      v-model:file="currentUploadFile"
      @success="onUploadSuccess"
    />

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
          点击"导入漫画"开始扩充您的漫画库
        </p>
      </div>

      <!-- 漫画网格视图 -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <ComicCard
          v-for="(comic, index) in filteredComics"
          :key="comic.id"
          :comic="comic"
          :index="index"
          @click="goToComicDetail"
          @toggle-favorite="toggleFavorite"
        />
      </div>

      <!-- 漫画列表视图 -->
      <div v-else class="space-y-4">
        <ComicListItem
          v-for="(comic, index) in filteredComics"
          :key="comic.id"
          :comic="comic"
          :index="index"
          @click="goToComicDetail"
        />
      </div>
    </main>
  </div>
</template>
