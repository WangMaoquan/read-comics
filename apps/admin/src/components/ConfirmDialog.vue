<script setup lang="ts">
  import { ref } from 'vue';

  const isOpen = ref(false);
  const title = ref('');
  const message = ref('');
  const confirmText = ref('确定');
  const cancelText = ref('取消');
  const type = ref<'danger' | 'info'>('info');

  let resolvePromise: (value: boolean) => void;

  const open = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
  }) => {
    title.value = options.title;
    message.value = options.message;
    confirmText.value = options.confirmText || '确定';
    cancelText.value = options.cancelText || '取消';
    type.value = options.type || 'info';
    isOpen.value = true;

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    isOpen.value = false;
    resolvePromise(true);
  };

  const handleCancel = () => {
    isOpen.value = false;
    resolvePromise(false);
  };

  defineExpose({ open });
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="handleCancel"
    ></div>

    <!-- Dialog -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all"
    >
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {{ title }}
      </h3>

      <p class="text-gray-600 dark:text-gray-300 mb-6">
        {{ message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="px-4 py-2 text-white rounded-lg transition-colors"
          :class="
            type === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          "
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
