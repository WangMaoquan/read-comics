<template>
  <button
    @click="cycleTheme"
    class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    :title="`当前主题: ${themeLabels[currentTheme]}`"
  >
    <!-- 太阳图标 (浅色模式) -->
    <svg
      v-if="currentTheme === 'light'"
      class="w-5 h-5 text-yellow-500"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </svg>

    <!-- 月亮图标 (深色模式) -->
    <svg
      v-else-if="currentTheme === 'dark'"
      class="w-5 h-5 text-blue-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
      />
    </svg>

    <!-- 自动图标 (跟随系统) -->
    <svg
      v-else
      class="w-5 h-5 text-gray-600 dark:text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useUIStore } from '../stores/ui';

  const uiStore = useUIStore();

  const currentTheme = computed(() => uiStore.theme);

  const themeLabels = {
    light: '浅色',
    dark: '深色',
    auto: '跟随系统',
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(uiStore.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    uiStore.setTheme(themes[nextIndex]);
  };
</script>
