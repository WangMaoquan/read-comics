<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
    <!-- 头部 -->
    <header
      class="sticky top-0 z-40 glass border-b border-white/20 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3 animate-fade-in">
            <h1 class="text-2xl font-bold text-gradient">设置</h1>
          </div>
          <nav
            class="flex space-x-1 animate-fade-in"
            style="animation-delay: 0.1s"
          >
            <router-link
              to="/"
              class="px-4 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              首页
            </router-link>
            <router-link
              to="/library"
              class="px-4 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              漫画库
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 阅读设置 -->
        <div
          class="card-glass p-6 animate-slide-up"
          style="animation-delay: 0.1s"
        >
          <h2
            class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
          >
            <span
              class="w-1 h-6 rounded-full bg-linear-to-b from-blue-500 to-purple-500"
            ></span>
            阅读设置
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  阅读模式
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  选择您偏好的阅读模式
                </p>
              </div>
              <select
                v-model="readingMode"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="single">单页</option>
                <option value="double">双页</option>
                <option value="scroll">滚动</option>
              </select>
            </div>
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  方向
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  设置阅读方向
                </p>
              </div>
              <select
                v-model="readingDirection"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="ltr">从左到右</option>
                <option value="rtl">从右到左</option>
                <option value="vertical">垂直</option>
              </select>
            </div>
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  缩放模式
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  设置图片缩放方式
                </p>
              </div>
              <select
                v-model="zoomMode"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="fit">适应屏幕</option>
                <option value="width">适应宽度</option>
                <option value="original">原始大小</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div
          class="card-glass p-6 animate-slide-up"
          style="animation-delay: 0.2s"
        >
          <h2
            class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
          >
            <span
              class="w-1 h-6 rounded-full bg-linear-to-b from-purple-500 to-pink-500"
            ></span>
            显示设置
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                >
                  主题
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  选择界面主题
                </p>
              </div>
              <select
                v-model="theme"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                >
                  字体大小
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  设置界面字体大小
                </p>
              </div>
              <select
                v-model="fontSize"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div
          class="flex justify-end space-x-4 pt-4 animate-fade-in"
          style="animation-delay: 0.3s"
        >
          <button
            @click="resetSettings"
            class="btn btn-ghost text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            重置设置
          </button>
          <button
            @click="saveSettings"
            class="btn btn-primary px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            保存设置
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useUIStore } from '@stores/ui';

  const uiStore = useUIStore();

  const readingMode = ref('single');
  const readingDirection = ref('ltr');
  const zoomMode = ref('fit');
  const theme = ref(uiStore.theme);
  const fontSize = ref('medium');

  // Watch for store changes
  watch(
    () => uiStore.theme,
    (newTheme) => {
      theme.value = newTheme;
    },
  );

  // Watch for local changes to update store immediately
  watch(theme, (newTheme) => {
    if (newTheme !== uiStore.theme) {
      uiStore.setTheme(newTheme as 'light' | 'dark' | 'auto');
    }
  });

  onMounted(() => {
    // Initialize theme from store
    theme.value = uiStore.theme;

    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      readingMode.value = settings.readingMode || 'single';
      readingDirection.value = settings.readingDirection || 'ltr';
      zoomMode.value = settings.zoomMode || 'fit';
      fontSize.value = settings.fontSize || 'medium';
    }
  });

  const resetSettings = () => {
    readingMode.value = 'single';
    readingDirection.value = 'ltr';
    zoomMode.value = 'fit';
    uiStore.setTheme('auto');
    fontSize.value = 'medium';
  };

  const saveSettings = () => {
    const settings = {
      readingMode: readingMode.value,
      readingDirection: readingDirection.value,
      zoomMode: zoomMode.value,
      theme: theme.value,
      fontSize: fontSize.value,
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));

    uiStore.setTheme(theme.value as 'light' | 'dark' | 'auto');

    alert('设置已保存');
  };
</script>
