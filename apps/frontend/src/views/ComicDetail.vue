<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-gray-600 hover:text-gray-900">
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
            <h1 class="text-2xl font-bold text-gray-900">漫画详情</h1>
          </div>
          <nav class="flex space-x-4">
            <router-link to="/library" class="text-gray-600 hover:text-gray-900"
              >漫画库</router-link
            >
            <router-link
              to="/settings"
              class="text-gray-600 hover:text-gray-900"
              >设置</router-link
            >
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        ></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="!comic" class="text-center py-12">
        <h3 class="text-lg font-medium text-gray-900">漫画未找到</h3>
        <p class="mt-1 text-gray-500">请检查链接或返回漫画库</p>
        <button @click="goBack" class="btn-primary mt-4">返回漫画库</button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 漫画封面和信息 -->
        <div class="lg:col-span-1">
          <div class="card">
            <div
              class="aspect-w-3 aspect-h-4 bg-gray-200 flex items-center justify-center rounded-t-lg"
            >
              <svg
                class="h-24 w-24 text-gray-400"
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
            <div class="p-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ comic.title }}
              </h2>
              <div class="space-y-2 text-sm text-gray-600">
                <p>
                  <span class="font-medium">章节总数:</span>
                  {{ comic.chapterCount }}
                </p>
                <p>
                  <span class="font-medium">作者:</span>
                  {{ comic.author || '未知' }}
                </p>
                <p>
                  <span class="font-medium">状态:</span>
                  {{ comic.status || '连载中' }}
                </p>
                <p>
                  <span class="font-medium">更新时间:</span>
                  {{ comic.updatedAt || '未知' }}
                </p>
              </div>
              <div class="mt-6 space-y-3">
                <button @click="startReading" class="btn-primary w-full">
                  开始阅读
                </button>
                <button class="btn-secondary w-full">添加到收藏</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 章节列表 -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">章节列表</h3>
              <div v-if="loadingChapters" class="text-center py-8">
                <div
                  class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
                ></div>
                <p class="mt-2 text-gray-600">加载章节中...</p>
              </div>
              <div v-else-if="chapters.length === 0" class="text-center py-8">
                <p class="text-gray-500">暂无章节</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="chapter in chapters"
                  :key="chapter.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  @click="readChapter(chapter.id)"
                >
                  <div>
                    <h4 class="font-medium text-gray-900">
                      {{ chapter.title }}
                    </h4>
                    <p class="text-sm text-gray-500">
                      {{ chapter.pageCount }} 页
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-if="chapter.isRead" class="text-sm text-green-600"
                      >已读</span
                    >
                    <span v-else class="text-sm text-gray-400">未读</span>
                    <svg
                      class="h-5 w-5 text-gray-400"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const loadingChapters = ref(false);
  const comic = ref<{
    id: number;
    title: string;
    author?: string;
    chapterCount: number;
    status?: string;
    updatedAt?: string;
  } | null>(null);
  const chapters = ref<
    Array<{
      id: number;
      title: string;
      pageCount: number;
      isRead: boolean;
    }>
  >([]);

  const comicId = parseInt(route.params.id as string);

  onMounted(async () => {
    loading.value = true;
    try {
      // TODO: Fetch comic details from API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      comic.value = {
        id: comicId,
        title: '漫画标题',
        author: '作者名',
        chapterCount: 20,
        status: '连载中',
        updatedAt: '2024-01-15',
      };
    } catch (error) {
      console.error('Failed to load comic:', error);
    } finally {
      loading.value = false;
    }

    loadingChapters.value = true;
    try {
      // TODO: Fetch chapters from API
      await new Promise((resolve) => setTimeout(resolve, 500));
      chapters.value = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `第 ${i + 1} 话`,
        pageCount: Math.floor(Math.random() * 30) + 10,
        isRead: i < 5,
      }));
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      loadingChapters.value = false;
    }
  });

  const goBack = () => {
    router.push('/library');
  };

  const startReading = () => {
    if (chapters.value.length > 0) {
      const firstChapter = chapters.value[0];
      if (firstChapter) {
        readChapter(firstChapter.id);
      }
    }
  };

  const readChapter = (chapterId: number) => {
    router.push(`/reader/${comicId}/${chapterId}`);
  };
</script>
