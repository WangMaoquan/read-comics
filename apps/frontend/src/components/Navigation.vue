<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();

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
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50"
  >
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-around items-center h-16">
        <template v-for="item in navItems" :key="item.route">
          <button
            @click="navigate(item.route)"
            :class="[
              'flex flex-col items-center justify-center w-full h-full transition-all duration-200',
              isActive(item.route)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            ]"
          >
            <!-- SVG 图标 -->
            <svg
              :class="[
                'w-6 h-6 mb-1',
                isActive(item.route)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
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
            <!-- 文本标签 -->
            <span
              :class="[
                'text-xs font-medium',
                isActive(item.route)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400',
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
