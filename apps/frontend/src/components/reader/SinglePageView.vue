<script setup lang="ts">
  defineProps<{
    currentImage: string;
    currentPage: number;
    totalPages: number;
    imageStyle: Record<string, string>;
  }>();
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] p-4">
    <div class="relative">
      <img
        :src="currentImage"
        :alt="`Page ${currentPage + 1}`"
        class="shadow-lg rounded-lg transition-all duration-300"
        :style="imageStyle"
        loading="lazy"
      />
      <!-- 页码显示 -->
      <div
        class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
      >
        {{ currentPage + 1 }} / {{ totalPages }}
      </div>
    </div>
  </div>
</template>
