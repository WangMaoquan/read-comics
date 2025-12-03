<script setup lang="ts">
  import type { Comic } from '@read-comics/types';

  defineProps<{
    comic: Comic;
    index: number;
  }>();

  defineEmits<{
    (e: 'click', id: string): void;
  }>();
</script>

<template>
  <div
    @click="$emit('click', comic.id)"
    class="card-glass p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-slide-up flex items-center gap-4"
    :style="{ animationDelay: `${index * 0.05}s` }"
  >
    <!-- 封面图片（与 ComicCard.vue 保持一致的展示/占位逻辑） -->
    <div
      class="shrink-0 w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm relative"
    >
      <img
        v-if="comic?.cover"
        :src="`/api${comic.cover}`"
        :alt="comic?.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg
          class="w-8 h-8 text-gray-400"
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

    <!-- 漫画信息 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
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
          {{ comic.status === 'completed' ? 100 : comic.lastReadAt ? 50 : 0 }}%
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
        @click.stop="$emit('click', comic.id)"
        class="btn btn-primary text-sm px-4 py-2"
      >
        开始阅读
      </button>
    </div>
  </div>
</template>
