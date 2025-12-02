<script setup lang="ts">
  import type { Chapter } from '@read-comics/types';
  import { ReadingMode } from '@read-comics/types';

  defineProps<{
    showControls: boolean;
    currentPage: number;
    totalPages: number;
    currentChapter: Chapter | null;
    readingMode: ReadingMode;
    readingModes: {
      value: ReadingMode;
      label: string;
      description: string;
    }[];
  }>();

  defineEmits<{
    (e: 'go-back'): void;
    (e: 'toggle-controls'): void;
    (e: 'change-mode', mode: ReadingMode): void;
  }>();
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 transition-all duration-300',
      showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
    ]"
  >
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <!-- 左侧：返回按钮 + 信息 -->
        <div class="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <button
            @click="$emit('go-back')"
            class="text-gray-300 hover:text-white transition-colors flex-shrink-0"
            title="返回"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
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
          </button>

          <!-- 章节信息 -->
          <div class="text-white min-w-0 flex-1">
            <!-- 小屏只显示页码 -->
            <div class="sm:hidden">
              <div class="font-medium text-sm">
                {{ currentPage + 1 }} / {{ totalPages }}
              </div>
            </div>
            <!-- 大屏显示完整信息 -->
            <div class="hidden sm:block">
              <div class="text-xs sm:text-sm text-gray-400 truncate">
                {{ currentChapter?.title }}
              </div>
              <div class="font-medium text-sm">
                {{ currentPage + 1 }} / {{ totalPages }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <!-- 阅读模式切换 -->
          <div
            class="flex items-center space-x-0.5 sm:space-x-1 bg-gray-700 rounded-lg p-0.5 sm:p-1"
          >
            <button
              v-for="mode in readingModes"
              :key="mode.value"
              @click="$emit('change-mode', mode.value)"
              :class="[
                'px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                readingMode === mode.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white',
              ]"
              :title="mode.description"
            >
              <span class="hidden sm:inline">{{ mode.label }}</span>
              <!-- 小屏只显示首字 -->
              <span class="sm:hidden">{{ mode.label.charAt(0) }}</span>
            </button>
          </div>

          <!-- 设置按钮 -->
          <button
            @click.stop="$emit('toggle-controls')"
            class="text-gray-300 hover:text-white transition-colors p-1 flex-shrink-0"
            title="隐藏/显示控制栏"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
