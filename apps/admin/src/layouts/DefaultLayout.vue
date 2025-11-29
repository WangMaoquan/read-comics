<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const isSidebarOpen = ref(true);

  const menuItems = [
    { name: '仪表盘', path: '/', icon: 'home' },
    { name: '漫画管理', path: '/comics', icon: 'book-open' },
    { name: '文件管理', path: '/files', icon: 'folder' },
    { name: '用户管理', path: '/users', icon: 'users' },
    { name: '系统日志', path: '/logs', icon: 'file-text' },
    { name: '数据备份', path: '/backups', icon: 'database' },
    { name: '系统设置', path: '/settings', icon: 'cog' },
  ];

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div
        class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700"
      >
        <h1 class="text-xl font-bold text-blue-600">Comics Admin</h1>
      </div>

      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          :class="{
            'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400':
              route.path === item.path,
          }"
        >
          <!-- 这里可以使用图标库，暂时用文字代替图标 -->
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header
        class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <button
          @click="toggleSidebar"
          class="lg:hidden text-gray-500 hover:text-gray-700"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-500">管理员</div>
          <div
            class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
          >
            A
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <router-view></router-view>
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
    ></div>
  </div>
</template>
