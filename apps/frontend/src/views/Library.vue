<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-2xl font-bold text-gray-900">漫画库</h1>
          <div class="flex items-center space-x-4">
            <button class="btn-secondary">导入漫画</button>
            <nav class="flex space-x-4">
              <router-link to="/" class="text-gray-600 hover:text-gray-900"
                >首页</router-link
              >
              <router-link
                to="/settings"
                class="text-gray-600 hover:text-gray-900"
                >设置</router-link
              >
            </nav>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">我的漫画</h2>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <input
                type="text"
                placeholder="搜索漫画..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        ></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="comics.length === 0" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">暂无漫画</h3>
        <p class="mt-1 text-gray-500">点击"导入漫画"开始添加您的漫画收藏</p>
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <div
          v-for="comic in comics"
          :key="comic.id"
          class="card cursor-pointer hover:shadow-lg transition-shadow"
          @click="goToComicDetail(comic.id)"
        >
          <div
            class="aspect-w-3 aspect-h-4 bg-gray-200 rounded-t-lg flex items-center justify-center"
          >
            <svg
              class="h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-900 truncate">
              {{ comic.title }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ comic.chapterCount }} 章节
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const loading = ref(false);
  const comics = ref<
    Array<{ id: number; title: string; chapterCount: number }>
  >([]);

  onMounted(() => {
    // TODO: Load comics from API
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      // Mock data
      comics.value = [
        { id: 1, title: '漫画标题1', chapterCount: 10 },
        { id: 2, title: '漫画标题2', chapterCount: 15 },
        { id: 3, title: '漫画标题3', chapterCount: 8 },
      ];
    }, 1000);
  });

  const goToComicDetail = (comicId: number) => {
    router.push(`/comic/${comicId}`);
  };
</script>
