<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 渐变网格背景 -->
    <div class="fixed inset-0 gradient-mesh"></div>
    <div
      class="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500"
    ></div>

    <!-- 主要内容 -->
    <div class="relative z-10">
      <!-- Hero 区域 -->
      <section class="container-custom py-20 px-4">
        <div class="text-center animate-fade-in">
          <!-- 主标题 -->
          <h1 class="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span class="text-gradient">漫画阅读器</span>
          </h1>

          <!-- 副标题 -->
          <p
            class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto"
          >
            开启您的精彩阅读之旅
          </p>
          <p
            class="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto"
          >
            沉浸式阅读体验 · 多种阅读模式 · 智能进度管理
          </p>

          <!-- CTA 按钮组 -->
          <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <router-link
              to="/library"
              class="btn btn-primary text-lg px-8 py-4 hover-glow"
            >
              <svg
                class="w-5 h-5 mr-2"
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
              浏览漫画库
            </router-link>

            <router-link
              to="/settings"
              class="btn btn-secondary text-lg px-8 py-4"
            >
              <svg
                class="w-5 h-5 mr-2"
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
              应用设置
            </router-link>
          </div>
        </div>

        <!-- 特性卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- 卡片 1 -->
          <div
            class="card-glass p-8 animate-slide-up flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            style="animation-delay: 0.1s"
          >
            <div
              class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 animate-float shadow-lg"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              快速开始
            </h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              轻松导入您的漫画文件,即刻开启流畅的阅读体验,支持多种常见格式
            </p>
          </div>

          <!-- 卡片 2 -->
          <div
            class="card-glass p-8 animate-slide-up flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            style="animation-delay: 0.2s"
          >
            <div
              class="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-6 animate-float shadow-lg"
              style="animation-delay: 0.5s"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              多种阅读模式
            </h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              支持单页、双页、滚动等多种阅读模式,自由切换,满足不同阅读习惯
            </p>
          </div>

          <!-- 卡片 3 -->
          <div
            class="card-glass p-8 animate-slide-up flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            style="animation-delay: 0.3s"
          >
            <div
              class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 animate-float shadow-lg"
              style="animation-delay: 1s"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              智能进度管理
            </h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              自动保存阅读进度,随时随地继续阅读,永不丢失您的阅读记录
            </p>
          </div>
        </div>
      </section>

      <!-- 底部装饰 -->
      <section class="container-custom pt-48 pb-20 px-4 mt-24">
        <div
          class="glass-card p-12 text-center max-w-4xl mx-auto animate-scale-in relative overflow-hidden group"
        >
          <!-- 背景装饰 -->
          <div
            class="absolute top-0 left-0 w-full h-full bg-linear-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>

          <div class="relative z-10">
            <h2
              class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
            >
              准备好开始了吗?
            </h2>
            <p
              class="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              立即探索您的漫画收藏,享受沉浸式阅读体验
            </p>
            <router-link
              to="/library"
              class="btn btn-primary text-lg px-12 py-4 hover-glow inline-flex items-center shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg
                class="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              开始探索
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Home component logic
</script>
