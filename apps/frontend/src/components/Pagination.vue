<template>
  <div class="flex items-center justify-center gap-2 mt-8 flex-wrap">
    <!-- 上一页 -->
    <button
      @click="goToPrevPage"
      :disabled="currentPage === 1"
      class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      上一页
    </button>

    <!-- 页码 -->
    <div class="flex gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-2 rounded-lg font-medium transition-all duration-200',
          page === currentPage
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- 下一页 -->
    <button
      @click="goToNextPage"
      :disabled="currentPage === totalPages"
      class="px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      下一页
    </button>

    <!-- 跳转 -->
    <div class="flex items-center gap-2 ml-4">
      <span class="text-sm text-gray-600 dark:text-gray-400">跳转到</span>
      <input
        v-model.number="jumpPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="w-16 px-2 py-1 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @keyup.enter="handleJump"
      />
      <button
        @click="handleJump"
        class="px-3 py-1 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        GO
      </button>
    </div>

    <!-- 总数显示 -->
    <div class="text-sm text-gray-600 dark:text-gray-400 ml-4">
      共 {{ total }} 条，第 {{ currentPage }}/{{ totalPages }} 页
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';

  interface Props {
    currentPage: number;
    totalPages: number;
    total: number;
  }

  interface Emits {
    (e: 'page-change', page: number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const jumpPage = ref<number>(props.currentPage);

  // 监听当前页变化，同步跳转输入框
  watch(
    () => props.currentPage,
    (newPage) => {
      jumpPage.value = newPage;
    },
  );

  // 计算可见页码
  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 7;

    if (props.totalPages <= maxVisible) {
      // 总页数少于最大可见数，显示所有页码
      for (let i = 1; i <= props.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 显示当前页前后各 3 页
      let start = Math.max(1, props.currentPage - 3);
      let end = Math.min(props.totalPages, props.currentPage + 3);

      // 确保始终显示 7 个页码
      if (end - start < maxVisible - 1) {
        if (start === 1) {
          end = Math.min(props.totalPages, start + maxVisible - 1);
        } else {
          start = Math.max(1, end - maxVisible + 1);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
      emit('page-change', page);
    }
  };

  const goToPrevPage = () => {
    if (props.currentPage > 1) {
      emit('page-change', props.currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (props.currentPage < props.totalPages) {
      emit('page-change', props.currentPage + 1);
    }
  };

  const handleJump = () => {
    if (
      jumpPage.value >= 1 &&
      jumpPage.value <= props.totalPages &&
      jumpPage.value !== props.currentPage
    ) {
      emit('page-change', jumpPage.value);
    }
  };
</script>
