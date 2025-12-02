<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { refDebounced } from '@vueuse/core';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import type { Comic } from '@read-comics/types';

  import { useComicStore } from '../stores/comic';
  import { filesService, comicsService } from '../api/services';
  import { validateFile } from '../utils/formatValidation';

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
      console.error('Failed to toggle favorite:', error);
    }
  };

  // 文件上传相关
  const uploadingFile = ref(false);
  const uploadProgress = ref(0);
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const showUploadModal = ref(false);
  const tagInput = ref('');

  const uploadForm = ref({
    file: null as File | null,
    title: '',
    author: '',
    description: '',
    tags: [] as string[],
  });

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
      alert(validation.error);
      target.value = '';
      return;
    }

    // 初始化表单并打开模态框
    uploadForm.value = {
      file,
      title: file.name.replace(/\.(cbz|zip)$/i, ''),
      author: '',
      description: '',
      tags: [],
    };
    tagInput.value = '';
    showUploadModal.value = true;

    // 重置 input，以便下次可以选择相同文件
    target.value = '';
  };

  const closeUploadModal = () => {
    showUploadModal.value = false;
    uploadForm.value = {
      file: null,
      title: '',
      author: '',
      description: '',
      tags: [],
    };
  };

  const addTag = () => {
    const tag = tagInput.value.trim();
    if (tag && !uploadForm.value.tags.includes(tag)) {
      uploadForm.value.tags.push(tag);
      tagInput.value = '';
    }
  };

  const removeTag = (index: number) => {
    uploadForm.value.tags.splice(index, 1);
  };

  const confirmUpload = async () => {
    if (!uploadForm.value.file) return;

    // 自动添加输入框中未添加的标签
    const pendingTag = tagInput.value.trim();
    if (pendingTag && !uploadForm.value.tags.includes(pendingTag)) {
      uploadForm.value.tags.push(pendingTag);
      tagInput.value = '';
    }

    uploadingFile.value = true;
    uploadProgress.value = 0;

    try {
      await filesService.uploadFile(
        uploadForm.value.file,
        {
          title: uploadForm.value.title,
          author: uploadForm.value.author,
          description: uploadForm.value.description,
          tags: uploadForm.value.tags,
        },
        (progress) => {
          uploadProgress.value = progress;
        },
      );

      // 上传成功后重新加载漫画列表
      await loadComics();
      closeUploadModal();
      alert('文件上传成功!');
    } catch (error) {
      console.error('上传错误:', error);
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      alert(errorMessage);
    } finally {
      uploadingFile.value = false;
      uploadProgress.value = 0;
    }
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
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            上传漫画
          </h3>
        </div>

        <div class="p-6 space-y-4">
          <!-- 文件信息 -->
          <div
            class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3"
          >
            <div
              class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ uploadForm.file?.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{
                  uploadForm.file
                    ? (uploadForm.file.size / 1024 / 1024).toFixed(2)
                    : 0
                }}
                MB
              </p>
            </div>
          </div>

          <!-- 标题 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >标题</label
            >
            <input
              v-model="uploadForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 作者 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >作者</label
            >
            <input
              v-model="uploadForm.author"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 标签 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >标签</label
            >
            <div class="flex gap-2 mb-2">
              <input
                v-model="tagInput"
                type="text"
                placeholder="输入标签后按回车"
                @keyup.enter="addTag"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                @click="addTag"
                class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in uploadForm.tags"
                :key="index"
                class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm flex items-center gap-1"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >描述</label
            >
            <textarea
              v-model="uploadForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <!-- 进度条 -->
          <div v-if="uploadingFile" class="space-y-2">
            <div
              class="flex justify-between text-sm text-gray-600 dark:text-gray-400"
            >
              <span>上传中...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div
              class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
            >
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div
          class="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3"
        >
          <button
            type="button"
            @click="closeUploadModal"
            :disabled="uploadingFile"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            @click="confirmUpload"
            :disabled="uploadingFile"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <LoadingSpinner v-if="uploadingFile" size="sm" />
            {{ uploadingFile ? '上传中...' : '确认上传' }}
          </button>
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
          点击"导入漫画"开始扩充您的漫画库
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
          @click="goToComicDetail(comic.id)"
          class="card-glass group cursor-pointer overflow-hidden hover-lift animate-scale-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <!-- 封面图片 -->
          <div
            class="aspect-w-3 aspect-h-4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
          >
            <img
              :src="comic.cover || '/placeholder-cover.jpg'"
              :alt="comic.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <!-- 遮罩层 -->
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2"
            >
              <button
                @click.stop="toggleFavorite(comic)"
                class="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors text-white"
                :title="comic.isFavorite ? '移出书架' : '加入书架'"
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
              </button>
            </div>

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
          @click="goToComicDetail(comic.id)"
          class="card-glass p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-slide-up flex items-center gap-4"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <!-- 封面图片 -->
          <div
            class="shrink-0 w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm"
          >
            <img
              :src="comic.cover || '/placeholder-cover.jpg'"
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
              @click.stop="goToComicDetail(comic.id)"
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
