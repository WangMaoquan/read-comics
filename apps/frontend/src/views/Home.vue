<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-2xl font-bold text-gray-900">漫画阅读器</h1>
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
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          欢迎使用漫画阅读器
        </h2>
        <p class="text-lg text-gray-600 mb-8">开始您的漫画阅读之旅</p>
        <div class="flex justify-center space-x-4">
          <router-link to="/library" class="btn-primary">
            浏览漫画库
          </router-link>
          <router-link to="/settings" class="btn-secondary"> 设置 </router-link>
        </div>
      </div>

      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">快速开始</h3>
            <p class="text-gray-600">导入您的漫画文件，开始阅读体验</p>
          </div>
        </div>
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              多种阅读模式
            </h3>
            <p class="text-gray-600">支持单页、双页、滚动等多种阅读模式</p>
          </div>
        </div>
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">阅读进度</h3>
            <p class="text-gray-600">自动保存阅读进度，随时继续</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  // Home component logic
</script>
