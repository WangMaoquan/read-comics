<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import Navigation from './Navigation.vue';
  import SearchBar from './SearchBar.vue';

  const route = useRoute();
  const isSearchVisible = ref(false);

  // 根据路由决定是否显示导航栏
  const showNavigation = computed(() => {
    return !['/reader', '/settings'].includes(route.path);
  });

  // 根据路由决定是否显示搜索栏
  const showSearchBar = computed(() => {
    return route.path === '/library';
  });

  const toggleSearch = () => {
    isSearchVisible.value = !isSearchVisible.value;
  };
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header
      v-if="showNavigation"
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 和标题 -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white font-bold text-sm">M</span>
              </div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
                漫画阅读器
              </h1>
            </router-link>
          </div>

          <!-- 搜索栏 -->
          <div v-if="showSearchBar" class="flex-1 max-w-lg mx-8">
            <SearchBar v-model:visible="isSearchVisible" />
          </div>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-4">
            <router-link
              to="/settings"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="设置"
            >
              <svg
                class="w-5 h-5"
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
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main
      :class="['transition-all duration-300', showNavigation ? 'pt-16' : '']"
    >
      <slot />
    </main>

    <!-- 底部导航栏 -->
    <Navigation v-if="showNavigation" />
  </div>
</template>
