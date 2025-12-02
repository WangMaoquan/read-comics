<script setup lang="ts">
  defineProps<{
    currentPage: number;
    totalPages: number;
    progress: number;
    isLastPage: boolean;
    hasNextChapter: boolean;
  }>();

  defineEmits<{
    (e: 'previous-page'): void;
    (e: 'next-page'): void;
    (e: 'next-chapter'): void;
  }>();
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700"
  >
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      <div class="flex items-center justify-between gap-2">
        <button
          @click="$emit('previous-page')"
          :disabled="currentPage === 0"
          class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="hidden sm:inline">上一页</span>
        </button>

        <div
          class="flex items-center space-x-2 sm:space-x-4 flex-1 justify-center min-w-0"
        >
          <!-- 进度条 -->
          <div class="flex-1 max-w-xs">
            <div class="w-full bg-gray-600 rounded-full h-1.5 sm:h-2">
              <div
                class="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>
          <!-- 进度百分比 -->
          <span class="text-gray-300 text-xs sm:text-sm whitespace-nowrap"
            >{{ progress }}%</span
          >
        </div>

        <!-- 下一页或下一章按钮 -->
        <button
          v-if="!isLastPage"
          @click="$emit('next-page')"
          class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-xs sm:text-sm"
        >
          <span class="hidden sm:inline">下一页</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          v-else-if="hasNextChapter"
          @click="$emit('next-chapter')"
          class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs sm:text-sm whitespace-nowrap"
        >
          <span class="hidden xs:inline">下一章</span>
          <span class="xs:hidden">下一章</span>
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
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>

        <div
          v-else
          class="flex items-center px-2 sm:px-4 py-2 text-gray-400 text-xs sm:text-sm"
        >
          已完成
        </div>
      </div>
    </div>
  </div>
</template>
