<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { comicsService, imagesService } from '../api/services';
  import type { Comic } from '@read-comics/types';

  const comics = ref<Comic[]>([]);
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedComics = ref<string[]>([]);
  const showEditModal = ref(false);
  const editingComic = ref<Comic | null>(null);

  // 表单数据
  const formData = ref({
    title: '',
    author: '',
    description: '',
    tags: [] as string[],
    rating: 0,
  });

  // 标签输入
  const tagInput = ref('');

  const filteredComics = computed(() => {
    if (!searchQuery.value) return comics.value;
    const query = searchQuery.value.toLowerCase();
    return comics.value.filter(
      (comic) =>
        comic.title.toLowerCase().includes(query) ||
        (comic.author && comic.author.toLowerCase().includes(query)),
    );
  });

  const selectedCount = computed(() => selectedComics.value.length);

  const getCoverUrl = (comic: Comic) => {
    if (!comic.coverPath) return '';
    if (comic.coverPath.startsWith('http')) return comic.coverPath;
    return imagesService.getThumbnailUrl(
      comic.filePath,
      comic.coverPath,
      100,
      150,
    );
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

  // 批量操作
  const toggleComicSelection = (comicId: string) => {
    const index = selectedComics.value.indexOf(comicId);
    if (index > -1) {
      selectedComics.value.splice(index, 1);
    } else {
      selectedComics.value.push(comicId);
    }
  };

  const selectAll = () => {
    if (selectedComics.value.length === comics.value.length) {
      selectedComics.value = [];
    } else {
      selectedComics.value = comics.value.map((c) => c.id);
    }
  };

  const batchDelete = async () => {
    if (!confirm(`确定要删除 ${selectedCount.value} 部漫画吗？`)) return;

    loading.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      comics.value = comics.value.filter(
        (c) => !selectedComics.value.includes(c.id),
      );
      selectedComics.value = [];
      alert('删除成功');
    } catch (error) {
      alert('删除失败');
    } finally {
      loading.value = false;
    }
  };

  // 编辑功能
  const openEditModal = (comic: Comic) => {
    editingComic.value = comic;
    formData.value = {
      title: comic.title,
      author: comic.author || '',
      description: comic.description || '',
      tags: comic.tags || [],
      rating: comic.rating || 0,
    };
    showEditModal.value = true;
  };

  const handleSave = async () => {
    if (!editingComic.value) return;

    loading.value = true;
    try {
      // TODO: API 调用更新漫画
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 更新本地数据
      const index = comics.value.findIndex(
        (c) => c.id === editingComic.value!.id,
      );
      if (index > -1) {
        Object.assign(comics.value[index], formData.value);
      }

      showEditModal.value = false;
      alert('保存成功');
    } catch (error) {
      alert('保存失败');
    } finally {
      loading.value = false;
    }
  };

  const deleteComic = async (id: string) => {
    if (!confirm('确定要删除这部漫画吗？')) return;

    loading.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      comics.value = comics.value.filter((c) => c.id !== id);
      alert('删除成功');
    } catch (error) {
      alert('删除失败');
    } finally {
      loading.value = false;
    }
  };

  // 标签管理
  const addTag = () => {
    const tag = tagInput.value.trim();
    if (tag && !formData.value.tags.includes(tag)) {
      formData.value.tags.push(tag);
      tagInput.value = '';
    }
  };

  const removeTag = (index: number) => {
    formData.value.tags.splice(index, 1);
  };

  onMounted(fetchComics);
</script>

<template>
  <div>
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">漫画管理</h1>
      <button
        @click="fetchComics"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': loading }"
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

    <!-- 工具栏 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <!-- 搜索 -->
        <div class="flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索漫画（标题/作者）..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- 批量操作 -->
        <div v-if="selectedCount > 0" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >已选 {{ selectedCount }}</span
          >
          <button
            @click="batchDelete"
            class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            批量删除
          </button>
          <button
            @click="selectedComics = []"
            class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>

    <!-- 漫画列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div
        v-if="loading && comics.length === 0"
        class="p-8 text-center text-gray-500"
      >
        加载中...
      </div>

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
              <th class="p-4 w-12">
                <input
                  type="checkbox"
                  :checked="
                    selectedComics.length === comics.length && comics.length > 0
                  "
                  @change="selectAll"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th class="p-4">封面</th>
              <th class="p-4">标题</th>
              <th class="p-4">作者</th>
              <th class="p-4">标签</th>
              <th class="p-4">评分</th>
              <th class="p-4">状态</th>
              <th class="p-4">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="comic in filteredComics"
              :key="comic.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :checked="selectedComics.includes(comic.id)"
                  @change="toggleComicSelection(comic.id)"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </td>
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
                <div class="flex gap-1 flex-wrap max-w-xs">
                  <span
                    v-for="tag in (comic.tags || []).slice(0, 3)"
                    :key="tag"
                    class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="(comic.tags || []).length > 3"
                    class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    +{{ (comic.tags || []).length - 3 }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-1">
                  <span v-for="i in 5" :key="i" class="text-sm">
                    {{ i <= (comic.rating || 0) ? '⭐' : '☆' }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  {{ comic.status || '已导入' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(comic)"
                    class="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteComic(comic.id)"
                    class="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div
          class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            编辑漫画
          </h2>
        </div>

        <form @submit.prevent="handleSave" class="p-6 space-y-4">
          <!-- 标题 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >标题 *</label
            >
            <input
              v-model="formData.title"
              type="text"
              required
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
              v-model="formData.author"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- 描述 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >描述</label
            >
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
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
                placeholder="输入标签后按回车添加"
                @keyup.enter="addTag"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                @click="addTag"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm flex items-center gap-2"
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

          <!-- 评分 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >评分</label
            >
            <div class="flex gap-2">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                @click="formData.rating = i"
                class="text-2xl transition-transform hover:scale-110"
              >
                {{ i <= formData.rating ? '⭐' : '☆' }}
              </button>
            </div>
          </div>

          <!-- 按钮 -->
          <div
            class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
