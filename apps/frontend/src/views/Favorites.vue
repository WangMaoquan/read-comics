<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          我的书架
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ stats.total }} 本书架中的漫画
        </p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">正在阅读</p>
              <p
                class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1"
              >
                {{ stats.reading }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
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
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">想读</p>
              <p
                class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1"
              >
                {{ stats.wantRead }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">已读完</p>
              <p
                class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1"
              >
                {{ stats.completed }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.value || 'all'"
          @click="currentTab = tab.value"
          class="px-4 py-2 rounded-lg font-medium transition-all duration-300"
          :class="[
            currentTab === tab.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- 漫画列表 -->
      <div
        v-else-if="filteredFavorites.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        <router-link
          v-for="favorite in filteredFavorites"
          :key="favorite.id"
          :to="`/comic/${favorite.comicId}`"
          class="group"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div
              class="aspect-3/4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
            >
              <img
                v-if="favorite.comic?.cover"
                :src="`/api${favorite.comic.cover}`"
                :alt="favorite.comic?.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <svg
                  class="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="p-4">
              <h3
                class="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {{ favorite.comic?.title || '未知标题' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ favorite.comic?.author || '未知作者' }}
              </p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <svg
          class="mx-auto h-24 w-24 text-gray-400"
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
        <h3 class="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
          书架为空
        </h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          去发现一些你喜欢的漫画吧
        </p>
        <router-link
          to="/library"
          class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          浏览漫画库
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import {
    favoritesService,
    FavoriteStatus,
    type Favorite,
  } from '@api/services';

  import { handleError } from '@/utils/errorHandler';

  const loading = ref(false);
  const favorites = ref<Favorite[]>([]);
  const stats = ref({
    total: 0,
    reading: 0,
    wantRead: 0,
    completed: 0,
  });
  const currentTab = ref<string | null>(null);

  const tabs = [
    { label: '全部', value: null },
    { label: '正在阅读', value: FavoriteStatus.READING },
    { label: '想读', value: FavoriteStatus.WANT_READ },
    { label: '已读完', value: FavoriteStatus.COMPLETED },
  ];

  const filteredFavorites = computed(() => {
    if (!currentTab.value) return favorites.value;
    return favorites.value.filter((f) => f.status === currentTab.value);
  });

  const loadFavorites = async () => {
    loading.value = true;
    try {
      favorites.value = await favoritesService.getFavorites();
    } catch (error) {
      handleError(error, '加载收藏失败');
    } finally {
      loading.value = false;
    }
  };

  const loadStats = async () => {
    try {
      stats.value = await favoritesService.getStats();
    } catch (error) {
      handleError(error, '加载统计失败');
    }
  };

  onMounted(() => {
    loadFavorites();
    loadStats();
  });
</script>
