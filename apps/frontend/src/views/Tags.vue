<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          标签浏览
        </h1>
        <p class="text-gray-600 dark:text-gray-400">按标签发现漫画</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- 标签列表 -->
      <div v-else-if="tags.length > 0" class="space-y-6">
        <!-- 热门标签 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <svg
              class="w-6 h-6 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            热门标签
          </h2>
          <div class="flex flex-wrap gap-3">
            <TagBadge
              v-for="tag in popularTags"
              :key="tag.id"
              :tag="tag"
              :show-count="true"
              @click="goToTag(tag)"
            />
          </div>
        </div>

        <!-- 所有标签 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            所有标签
          </h2>
          <div class="flex flex-wrap gap-3">
            <TagBadge
              v-for="tag in tags"
              :key="tag.id"
              :tag="tag"
              :show-count="true"
              @click="goToTag(tag)"
            />
          </div>
        </div>

        <!-- 选中标签的漫画 -->
        <div
          v-if="selectedTag && tagComics.length > 0"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <TagBadge :tag="selectedTag" :clickable="false" />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                相关漫画
              </span>
            </h2>
            <button
              @click="clearSelection"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              清除筛选
            </button>
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            <router-link
              v-for="comic in tagComics"
              :key="comic.id"
              :to="`/comic/${comic.id}`"
              class="group"
            >
              <div
                class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div
                  class="aspect-3/4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
                >
                  <img
                    v-if="comic.cover"
                    :src="`/api${comic.cover}`"
                    :alt="comic.title"
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
                    {{ comic.title || '未知标题' }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ comic.author || '未知作者' }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>
        </div>
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <h3 class="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
          暂无标签
        </h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          管理员可以创建标签来组织漫画
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { tagsService, type Tag } from '@api/services';
  import TagBadge from '@components/TagBadge.vue';

  import { handleError } from '@/utils/errorHandler';

  const loading = ref(false);
  const tags = ref<Tag[]>([]);
  const selectedTag = ref<Tag | null>(null);
  const tagComics = ref<any[]>([]);

  const popularTags = computed(() => {
    return tags.value
      .filter((tag) => (tag.readCount || 0) > 0) // 至少被阅读过一次
      .sort((a, b) => (b.readCount || 0) - (a.readCount || 0)) // 按阅读次数降序
      .slice(0, 10);
  });

  const loadTags = async () => {
    loading.value = true;
    try {
      tags.value = await tagsService.getTags();
    } catch (error) {
      handleError(error, '加载标签失败');
    } finally {
      loading.value = false;
    }
  };

  const goToTag = async (tag: Tag) => {
    selectedTag.value = tag;
    try {
      tagComics.value = await tagsService.getComicsByTag(tag.id);
    } catch (error) {
      handleError(error, '加载标签漫画失败');
    }
  };

  const clearSelection = () => {
    selectedTag.value = null;
    tagComics.value = [];
  };

  onMounted(() => {
    loadTags();
  });
</script>
