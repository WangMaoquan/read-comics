<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useUIStore } from '../stores/ui';

  const route = useRoute();
  const uiStore = useUIStore();

  // 根据路由决定是否显示顶部导航栏
  const showTopNav = computed(() => {
    return !['/reader', '/settings', '/auth'].includes(route.path);
  });

  const readerBgColor = computed(() =>
    route.path.includes('/reader') ? 'bg-gray-900' : '',
  );

  const toggleTheme = () => {
    const modes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(uiStore.theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    uiStore.setTheme(modes[nextIndex]);
  };

  const themeTitle = computed(() => {
    switch (uiStore.theme) {
      case 'light':
        return '当前：浅色模式';
      case 'dark':
        return '当前：深色模式';
      case 'auto':
        return '当前：跟随系统';
      default:
        return '切换主题';
    }
  });
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300"
  >
    <!-- 顶部导航栏 -->
    <header
      v-if="showTopNav"
      class="fixed top-0 left-0 right-0 glass bg-white/70 border-b border-gray-200 dark:border-gray-700 z-40 transition-all duration-300"
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
            <!-- 主题切换按钮 -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-full text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-gray-800 transition-all duration-300"
              :title="themeTitle"
            >
              <!-- Light Mode Icon -->
              <svg
                v-if="uiStore.theme === 'light'"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <!-- Dark Mode Icon -->
              <svg
                v-else-if="uiStore.theme === 'dark'"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <!-- Auto Mode Icon -->
              <svg
                v-else
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>

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
        readerBgColor,
      ]"
    >
      <slot />
    </main>
  </div>
</template>
