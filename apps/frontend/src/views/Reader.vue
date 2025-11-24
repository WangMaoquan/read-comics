<template>
  <div class="min-h-screen bg-gray-900">
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-gray-300 hover:text-white">
              <svg
                class="h-6 w-6"
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
            <h1 class="text-xl font-semibold text-white">阅读器</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @="toggleSettings" class="text-gray-300 hover:text-white">
              <svg
                class="h-6 w-6"
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

    <main class="relative">
      <!-- 阅读区域 -->
      <div class="flex items-center justify-center min-h-[80vh] p-4">
        <div v-if="loading" class="text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"
          ></div>
          <p class="mt-2 text-gray-400">加载中...</p>
        </div>
        <div v-else-if="!currentImage" class="text-center">
          <p class="text-gray-400">页面加载失败</p>
        </div>
        <img
          v-else
          :src="currentImage"
          :alt="`Page ${currentPage + 1}`"
          class="max-w-full max-h-[70vh] object-contain"
          @load="onImageLoad"
        />
      </div>

      <!-- 页面导航 -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <button
              @click="previousPage"
              :disabled="currentPage === 0"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span class="text-gray-300">
              {{ currentPage + 1 }} / {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages - 1"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const images = ref<string[]>([]);
  const currentPage = ref(0);

  const comicId = parseInt(route.params.comicId as string);
  const chapterId = parseInt(route.params.chapterId as string);

  const totalPages = computed(() => images.value.length);
  const currentImage = computed(() => images.value[currentPage.value]);

  onMounted(async () => {
    loading.value = true;
    try {
      // TODO: Fetch chapter images from API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock images
      images.value = Array.from(
        { length: 20 },
        (_, i) => `https://picsum.photos/800/1200?random=${i}`,
      );
    } catch (error) {
      console.error('Failed to load chapter images:', error);
    } finally {
      loading.value = false;
    }
  });

  const goBack = () => {
    router.push(`/comic/${comicId}`);
  };

  const previousPage = () => {
    if (currentPage.value > 0) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value - 1) {
      currentPage.value++;
    }
  };

  const onImageLoad = () => {
    // 图片加载完成后的处理
  };

  const toggleSettings = () => {
    // TODO: 打开设置面板
  };
</script>
