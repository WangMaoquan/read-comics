<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center"
  >
    <div class="text-center">
      <svg
        class="mx-auto h-24 w-24 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h1 class="mt-4 text-3xl font-bold text-gray-900">404</h1>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">页面未找到</h2>
      <p class="mt-2 text-gray-600">抱歉，您访问的页面不存在。</p>
      <div class="mt-6">
        <router-link to="/" class="btn-primary"> 返回首页 </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // NotFound component
</script>
