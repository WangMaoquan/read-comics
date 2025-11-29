<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { comicsService, imagesService } from '../api/services';
  import type { Comic } from '@read-comics/types';

  const comics = ref<Comic[]>([]);
  const loading = ref(false);
  const searchQuery = ref('');

  const filteredComics = computed(() => {
    if (!searchQuery.value) return comics.value;
    const query = searchQuery.value.toLowerCase();
    return comics.value.filter(
      (comic) =>
        comic.title.toLowerCase().includes(query) ||
        (comic.author && comic.author.toLowerCase().includes(query)),
    );
  });

  const getCoverUrl = (comic: Comic) => {
    if (!comic.coverPath) return '';
    // 如果 coverPath 已经是 URL (比如以 http 开头)，直接返回
    if (comic.coverPath.startsWith('http')) return comic.coverPath;

    // 否则使用 thumbnail 服务
    return imagesService.getThumbnailUrl(comic.filePath, comic.coverPath);
  };

  const fetchComics = async () => {
    loading.value = true;
    try {
      comics.value = await comicsService.getComics();
    } catch (error) {
      console.error('Failed to fetch comics:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchComics);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      漫画管理
    </h1>
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div
        class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索漫画..."
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          @click="fetchComics"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新列表
        </button>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500">加载中...</div>

      <div
        v-else-if="filteredComics.length === 0"
        class="p-8 text-center text-gray-500"
      >
        暂无数据
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-medium">封面</th>
              <th class="p-4 font-medium">标题</th>
              <th class="p-4 font-medium">作者</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="comic in filteredComics"
              :key="comic.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4 w-20">
                <div
                  class="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
                >
                  <img
                    v-if="comic.coverPath"
                    :src="getCoverUrl(comic)"
                    class="w-full h-full object-cover"
                    alt="cover"
                  />
                </div>
              </td>
              <td class="p-4">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ comic.title }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ new Date(comic.createdAt).getFullYear() }}
                </div>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-300">
                {{ comic.author || '未知作者' }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  已导入
                </span>
              </td>
              <td class="p-4">
                <button
                  class="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium"
                >
                  编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
