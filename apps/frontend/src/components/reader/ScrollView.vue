<script setup lang="ts">
  defineProps<{
    images: string[];
    totalPages: number;
    imageStyle: Record<string, string>;
  }>();
</script>

<template>
  <div class="relative">
    <div class="max-w-4xl mx-auto p-4 space-y-8">
      <div v-for="(image, index) in images" :key="index" class="relative">
        <img
          :src="image"
          :alt="`Page ${index + 1}`"
          class="shadow-lg rounded-lg mx-auto transition-all duration-300"
          :style="imageStyle"
          loading="lazy"
        />
        <div
          class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
        >
          {{ index + 1 }} / {{ totalPages }}
        </div>
      </div>
    </div>
  </div>
</template>
