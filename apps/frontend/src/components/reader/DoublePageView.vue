<script setup lang="ts">
  defineProps<{
    images: string[];
    currentImage: string;
    currentPage: number;
  }>();
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] p-4 space-x-2">
    <template v-if="currentPage > 0">
      <div class="relative">
        <img
          :src="images[currentPage - 1]"
          :alt="`Page ${currentPage}`"
          class="max-w-full max-h-[90vh] object-contain shadow-lg rounded-lg"
          loading="lazy"
        />
        <div
          class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
        >
          {{ currentPage }}
        </div>
      </div>
    </template>

    <div class="relative">
      <img
        :src="currentImage"
        :alt="`Page ${currentPage + 1}`"
        class="max-w-full max-h-[90vh] object-contain shadow-lg rounded-lg"
        loading="lazy"
      />
      <div
        class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
      >
        {{ currentPage + 1 }}
      </div>
    </div>
  </div>
</template>
