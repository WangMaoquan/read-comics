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
