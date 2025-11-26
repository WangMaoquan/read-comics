<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  // 根据路由决定是否显示顶部导航栏
  const showTopNav = computed(() => {
    return !['/reader', '/settings'].includes(route.path);
  });
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  >
    <!-- 顶部导航栏 -->
    <header
      v-if="showTopNav"
      class="fixed top-0 left-0 right-0 glass z-40 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 和标题 -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <span class="text-white font-bold text-lg">M</span>
              </div>
              <h1
                class="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
              >
                漫画阅读器
              </h1>
            </router-link>
          </div>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-2">
            <!-- 设置按钮 -->
            <router-link
              to="/settings"
              class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-300"
              title="设置"
            >
              <svg
                class="w-6 h-6"
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
      :class="[
        'transition-all duration-300 min-h-screen',
        showTopNav ? 'pt-20 pb-8' : '',
      ]"
    >
      <slot />
    </main>
  </div>
</template>
