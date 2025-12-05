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
                  <span v-if="!isMobile">设置图片缩放方式</span>
                  <span v-else class="text-yellow-600 dark:text-yellow-400"
                    >移动端固定为适应屏幕</span
                  >
                </p>
              </div>
              <select
                v-model="zoomMode"
                :disabled="isMobile"
                class="form-select bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <!-- 存储设置 -->
        <div
          class="card-glass p-6 animate-slide-up"
          style="animation-delay: 0.3s"
        >
          <h2
            class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
          >
            <span
              class="w-1 h-6 rounded-full bg-linear-to-b from-pink-500 to-red-500"
            ></span>
            存储设置
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                >
                  漫画存储位置
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  设置漫画文件存储路径
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  class="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md font-mono"
                  >{{ comicStoragePath }}</span
                >
                <button
                  @click="changeStoragePath"
                  class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  更改
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                >
                  缓存管理
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  管理应用缓存
                </p>
              </div>
              <button
                @click="clearCache"
                class="btn btn-secondary text-sm px-4 py-2"
              >
                清除缓存
              </button>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div
          class="card-glass p-6 animate-slide-up"
          style="animation-delay: 0.4s"
        >
          <h2
            class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
          >
            <span
              class="w-1 h-6 rounded-full bg-linear-to-b from-yellow-500 to-orange-500"
            ></span>
            其他设置
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
                >
                  自动更新
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  自动检查应用更新
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="autoUpdate"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"
                ></div>
              </label>
            </div>
            <div class="flex items-center justify-between group">
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
                >
                  数据备份
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  定期备份阅读数据
                </p>
              </div>
              <button
                @click="backupData"
                class="btn btn-secondary text-sm px-4 py-2"
              >
                备份数据
              </button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div
          class="flex justify-end space-x-4 pt-4 animate-fade-in"
          style="animation-delay: 0.5s"
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
  import { ref, computed, onMounted, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useWindowSize } from '@vueuse/core';
  import { useUIStore } from '../stores/ui';
  import { useSettingsStore } from '../stores/settings';
  import { toast } from '../composables/useToast';
  import { api } from '../api/client';
  import { performanceMonitor } from '../utils/performance';
  import { logger } from '../utils/logger';

  const uiStore = useUIStore();
  const settingsStore = useSettingsStore();

  // 使用 storeToRefs 保持响应性
  const {
    readingMode,
    readingDirection,
    zoomMode,
    fontSize,
    autoUpdate,
    comicStoragePath,
  } = storeToRefs(settingsStore);

  // Theme 单独处理，因为它属于 UI Store
  const theme = ref(uiStore.theme);

  // 响应式移动端检测（结合窗口大小和设备类型）
  const { width } = useWindowSize();

  // 检测设备类型
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // 组合检测：移动设备 或 窗口宽度小于 640px
  const isMobile = computed(() => isMobileDevice || width.value < 640);

  // 监听 theme 变化
  watch(theme, (newTheme) => {
    if (newTheme !== uiStore.theme) {
      uiStore.setTheme(newTheme as 'light' | 'dark' | 'auto');
    }
  });

  // 监听 store 中的 theme 变化同步回本地 ref
  watch(
    () => uiStore.theme,
    (newTheme) => {
      theme.value = newTheme;
    },
  );

  onMounted(() => {
    theme.value = uiStore.theme;
  });

  const changeStoragePath = () => {
    // TODO: 实现存储路径更改，可能需要调用 Electron API 或后端 API
    toast.info('存储路径更改功能待实现');
  };

  const clearCache = () => {
    try {
      // 清除 API 缓存
      if (api.client.cache) {
        api.client.cache.clear();
        logger.info('API cache cleared');
      }

      // 清除性能监控数据
      performanceMonitor.clear();
      logger.info('Performance monitoring data cleared');

      // 清除日志（保留最近的错误日志）
      const errorLogs = logger.getLogs().filter((log) => log.level === 'ERROR');
      logger.clear();
      logger.info('Cache and logs cleared', {
        preservedErrorLogs: errorLogs.length,
      });

      toast.success('缓存已清除');
    } catch (error) {
      logger.error('Failed to clear cache', error);
      toast.error('清除缓存失败');
    }
  };

  const backupData = () => {
    // TODO: 实现数据备份
    toast.info('数据备份功能待实现');
  };

  const resetSettings = () => {
    settingsStore.resetSettings();
    uiStore.setTheme('auto');
    toast.success('设置已重置');
  };

  const saveSettings = () => {
    // 设置已通过 store 自动保存到 localStorage
    // 这里只提供用户反馈
    toast.success('设置已保存');
  };
</script>
