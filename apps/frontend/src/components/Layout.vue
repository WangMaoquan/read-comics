<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Navigation from './Navigation.vue';
  import { useUIStore } from '@stores/ui';
  import { useAuthStore } from '@stores/auth';

  const route = useRoute();
  const router = useRouter();
  const uiStore = useUIStore();
  const authStore = useAuthStore();
  const userMenuOpen = ref(false);

  const navItems = [
    { name: '漫画库', path: '/library' },
    { name: '书架', path: '/favorites' },
    { name: '标签', path: '/tags' },
  ];

  const handleLogout = () => {
    authStore.clearAuth();
    router.push('/auth');
  };

  const toggleUserMenu = () => {
    userMenuOpen.value = !userMenuOpen.value;
  };

  const closeUserMenu = () => {
    userMenuOpen.value = false;
  };

  // 点击外部关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      closeUserMenu();
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

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
            <router-link to="/" class="flex items-center space-x-3 group mr-8">
              <div
                class="w-10 h-10 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <span class="text-white font-bold text-lg">M</span>
              </div>
              <h1
                class="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
              >
                漫画阅读器
              </h1>
            </router-link>

            <!-- 桌面端导航链接 (仅在大屏显示) -->
            <nav class="hidden md:flex items-center space-x-1">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="[
                  route.path === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                ]"
              >
                {{ item.name }}
              </router-link>
            </nav>
          </div>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-4">
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

            <!-- 用户菜单 -->
            <div class="relative user-menu-container">
              <button
                @click.stop="toggleUserMenu"
                class="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
              >
                <div
                  class="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm"
                >
                  {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <span class="hidden sm:inline font-medium">{{
                  authStore.user?.username || '用户'
                }}</span>
                <svg
                  :class="[
                    'w-4 h-4 text-gray-400 transition-all duration-200',
                    userMenuOpen ? 'rotate-180 text-blue-500' : '',
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- 下拉菜单 -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-show="userMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-gray-700 transform origin-top-right z-50"
                >
                  <router-link
                    to="/profile"
                    @click="closeUserMenu"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    个人资料
                  </router-link>
                  <router-link
                    to="/settings"
                    @click="closeUserMenu"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    设置
                  </router-link>
                  <div
                    class="border-t border-gray-100 dark:border-gray-700 my-1"
                  ></div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main
      :class="[
        'transition-all duration-300 min-h-screen',
        showTopNav ? 'pt-20 pb-20 md:pb-8' : '',
        readerBgColor,
      ]"
    >
      <slot />
    </main>

    <!-- 移动端底部导航栏 -->
    <div class="md:hidden" v-if="showTopNav">
      <Navigation />
    </div>
  </div>
</template>
