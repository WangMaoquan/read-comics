<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import type { Comic } from '@read-comics/types';
  import { ComicStatus } from '@read-comics/types';

  const router = useRouter();

  // 状态管理
  const loading = ref(false);
  const comics = ref<Comic[]>([]);
  const viewMode = ref<'grid' | 'list'>('grid');
  const searchQuery = ref('');
  const sortBy = ref<'title' | 'date' | 'progress'>('date');

  // 过滤和排序
  const filteredComics = computed(() => {
    let result = [...comics.value];

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      result = result.filter(
        (comic) =>
          comic.title.toLowerCase().includes(query) ||
          comic.author?.toLowerCase().includes(query) ||
          comic.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy.value) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'progress':
          return (
            (b.status === 'completed' ? 100 : b.lastReadAt ? 50 : 0) -
            (a.status === 'completed' ? 100 : a.lastReadAt ? 50 : 0)
          );
        default:
          return 0;
      }
    });

    return result;
  });

  // 模拟数据加载
  const loadComics = async () => {
    loading.value = true;
    try {
      // TODO: 实际从 API 加载数据
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟数据
      comics.value = [
        {
          id: '1',
          title: '进击的巨人',
          author: '谏山创',
          description: '人类与巨人的生存之战',
          coverPath: '/covers/attack-on-titan.jpg',
          totalPages: 139,
          status: ComicStatus.READING,
          tags: ['热血', '战斗', '奇幻'],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          title: '鬼灭之刃',
          author: '吾峠呼世晴',
          description: '兄妹二人对抗恶鬼的故事',
          coverPath: '/covers/demon-slayer.jpg',
          totalPages: 205,
          status: ComicStatus.COMPLETED,
          tags: ['热血', '战斗', '历史'],
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: '3',
          title: '海贼王',
          author: '尾田荣一郎',
          description: '路飞成为海贼王的冒险故事',
          coverPath: '/covers/one-piece.jpg',
          totalPages: 1000,
          status: ComicStatus.READING,
          tags: ['冒险', '热血', '友情'],
          createdAt: new Date('2022-12-01'),
          updatedAt: new Date('2024-03-01'),
        },
        {
          id: '4',
          title: '火影忍者',
          author: '岸本齐史',
          description: '忍者世界的成长故事',
          coverPath: '/covers/naruto.jpg',
          totalPages: 700,
          status: ComicStatus.READING,
          tags: ['忍者', '成长', '战斗'],
          createdAt: new Date('2022-11-01'),
          updatedAt: new Date('2024-04-01'),
        },
        {
          id: '5',
          title: '咒术回战',
          author: '芥见下々',
          description: '现代咒术师的战斗故事',
          coverPath: '/covers/jujutsu-kaisen.jpg',
          filePath: '/comics/jujutsu-kaisen',
          fileSize: 800000000,
          fileFormat: 'folder' as any,
          totalPages: 250,
          status: ComicStatus.READING,
          tags: ['都市', '战斗', '超自然'],
          createdAt: new Date('2023-03-01'),
          updatedAt: new Date('2024-05-01'),
        },
      ];
    } catch (error) {
      console.error('Failed to load comics:', error);
    } finally {
      loading.value = false;
    }
  };

  // 导航到漫画详情
  const goToComicDetail = (comicId: number) => {
    router.push(`/comic/${comicId}`);
  };

  // 导入漫画
  const importComics = () => {
    // TODO: 实现导入功能
    console.log('Import comics...');
  };

  // 初始化
  onMounted(() => {
    loadComics();
  });
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 页面标题和操作栏 -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <!-- 标题 -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              漫画库
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              共 {{ comics.length }} 部漫画
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-3">
            <!-- 导入按钮 -->
            <button
              @click="importComics"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              导入漫画
            </button>

            <!-- 视图切换 -->
            <div class="flex rounded-md shadow-sm">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-l-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-200',
                ]"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-r-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-200',
                ]"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 搜索和过滤栏 -->
        <div class="mt-6 flex flex-col sm:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索漫画标题、作者或标签..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- 排序选择 -->
          <select
            v-model="sortBy"
            class="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">按添加时间排序</option>
            <option value="title">按标题排序</option>
            <option value="progress">按阅读进度排序</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>

      <!-- 空状态 -->
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
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          暂无漫画
        </h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          点击"导入漫画"开始添加您的漫画收藏
        </p>
      </div>

      <!-- 漫画网格视图 -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <div
          v-for="comic in filteredComics"
          :key="comic.id"
          @click="goToComicDetail(Number(comic.id))"
          class="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <!-- 封面图片 -->
          <div
            class="aspect-w-3 aspect-h-4 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
          >
            <img
              :src="comic.coverPath || '/placeholder-cover.jpg'"
              :alt="comic.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <!-- 进度条 -->
            <div
              v-if="comic.lastReadAt"
              class="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600"
            >
              <div
                class="h-full bg-blue-600 transition-all duration-300"
                :style="{
                  width: `${comic.status === 'completed' ? 100 : comic.lastReadAt ? 50 : 0}%`,
                }"
              />
            </div>
          </div>

          <!-- 漫画信息 -->
          <div class="p-4">
            <h3 class="font-medium text-gray-900 dark:text-white truncate mb-1">
              {{ comic.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
              {{ comic.author }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ comic.totalPages }} 页
              </span>
              <span
                v-if="comic.lastReadAt"
                class="text-xs font-medium"
                :class="[
                  comic.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400',
                ]"
              >
                {{
                  comic.status === 'completed'
                    ? 100
                    : comic.lastReadAt
                      ? 50
                      : 0
                }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 漫画列表视图 -->
      <div
        v-else
        class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="comic in filteredComics"
            :key="comic.id"
            @click="goToComicDetail(Number(comic.id))"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-4">
              <!-- 封面图片 -->
              <div
                class="flex-shrink-0 w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
              >
                <img
                  :src="comic.coverPath || '/placeholder-cover.jpg'"
                  :alt="comic.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <!-- 漫画信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white truncate"
                  >
                    {{ comic.title }}
                  </h3>
                  <span
                    v-if="comic.lastReadAt"
                    class="text-sm font-medium"
                    :class="[
                      comic.status === 'completed'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400',
                    ]"
                  >
                    {{
                      comic.status === 'completed'
                        ? 100
                        : comic.lastReadAt
                          ? 50
                          : 0
                    }}%
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ comic.author }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ comic.totalPages }} 页
                </p>
                <div
                  v-if="comic.tags && comic.tags.length > 0"
                  class="mt-2 flex flex-wrap gap-1"
                >
                  <span
                    v-for="tag in comic.tags.slice(0, 3)"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex-shrink-0">
                <button
                  @click.stop="goToComicDetail(Number(comic.id))"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  开始阅读
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
