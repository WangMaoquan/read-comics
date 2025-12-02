<script setup lang="ts">
  import { ref } from 'vue';

  export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }

  const toasts = ref<ToastMessage[]>([]);
  let idCounter = 0;

  const add = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration = 3000,
  ) => {
    const id = idCounter++;
    toasts.value.push({ id, message, type });
    setTimeout(() => remove(id), duration);
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  // 暴露给外部使用
  defineExpose({ add });

  // 颜色映射
  const typeClasses = {
    success:
      'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    error:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    warning:
      'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3"
        :class="typeClasses[toast.type]"
      >
        <span class="text-lg font-bold">{{ iconMap[toast.type] }}</span>
        <p class="text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="ml-auto text-current opacity-50 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
