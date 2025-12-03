<script setup lang="ts">
  import type { Comic } from '@read-comics/types';

  defineProps<{
    comic: Comic;
    index: number;
  }>();

  defineEmits<{
    (e: 'click', id: string): void;
    (e: 'toggle-favorite', comic: Comic): void;
  }>();
</script>

<template>
  <div
    @click="$emit('click', comic.id)"
    class="card-glass group cursor-pointer overflow-hidden hover-lift animate-scale-in"
    :style="{ animationDelay: `${index * 0.05}s` }"
  >
    <!-- 封面图片（与 Favorites.vue 保持一致的展示/占位逻辑） -->
    <div
      class="aspect-3/4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
    >
      <img
        v-if="comic?.cover"
        :src="`/api${comic.cover}`"
        :alt="comic?.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
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

    <!-- 遮罩层 -->
    <div
      class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2"
    >
      <button
        @click.stop="$emit('toggle-favorite', comic)"
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
          {{ comic.status === 'completed' ? 100 : comic.lastReadAt ? 50 : 0 }}%
        </span>
      </div>
    </div>
  </div>
</template>
