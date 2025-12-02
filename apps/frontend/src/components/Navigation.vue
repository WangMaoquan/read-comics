<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@stores/auth';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const navItems = [
    {
      name: '首页',
      route: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: '漫画库',
      route: '/library',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      name: '书架',
      route: '/favorites',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    {
      name: '标签',
      route: '/tags',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    },
    {
      name: '用户',
      route: '/auth',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  ];

  const isActive = (routeName: string) => {
    return route.path === routeName;
  };

  const navigate = (routeName: string) => {
    router.push(routeName);
  };
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 glass backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-t border-white/20 z-50 pb-safe shadow-lg-up"
  >
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-around items-center h-16 md:h-20">
        <template v-for="item in navItems" :key="item.route">
          <button
            @click="navigate(item.route)"
            class="group relative flex flex-col items-center justify-center w-full h-full transition-all duration-300"
          >
            <!-- Active State Background Glow -->
            <div
              class="absolute inset-0 bg-linear-to-t from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300"
              :class="{ 'opacity-100': isActive(item.route) }"
            ></div>

            <!-- Top Indicator Bar -->
            <div
              class="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-b-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
              :class="[
                isActive(item.route)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-full',
              ]"
            ></div>

            <!-- Icon Container -->
            <div
              class="relative p-2 rounded-xl transition-all duration-300 group-hover:-translate-y-1"
              :class="[
                isActive(item.route)
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              ]"
            >
              <svg
                class="w-6 h-6 md:w-7 md:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
            </div>

            <!-- 文本标签 -->
            <span
              class="text-xs font-medium mt-1 transition-all duration-300"
              :class="[
                isActive(item.route)
                  ? 'text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 font-bold scale-105'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200',
              ]"
            >
              {{ item.name }}
            </span>
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
