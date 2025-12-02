<script setup lang="ts">
  defineProps<{
    show: boolean;
    isMobile: boolean;
  }>();
</script>

<template>
  <div
    v-if="show && !isMobile"
    class="fixed top-20 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 z-40 hidden sm:block"
  >
    <div class="font-medium mb-2">快捷键:</div>
    <div class="space-y-1 text-xs">
      <div>←/→ 或 空格/Enter: 翻页</div>
      <div>↑/↓: 翻页</div>
      <div>1/2/3: 切换阅读模式</div>
      <div>H: 隐藏控制栏</div>
      <div>ESC: 返回</div>
    </div>
  </div>
</template>
