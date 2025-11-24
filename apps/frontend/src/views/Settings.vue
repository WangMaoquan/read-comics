<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-2xl font-bold text-gray-900">设置</h1>
          <nav class="flex space-x-4">
            <router-link to="/" class="text-gray-600 hover:text-gray-900"
              >首页</router-link
            >
            <router-link to="/library" class="text-gray-600 hover:text-gray-900"
              >漫画库</router-link
            >
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 阅读设置 -->
        <div class="card">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">阅读设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">阅读模式</h3>
                  <p class="text-sm text-gray-500">选择您偏好的阅读模式</p>
                </div>
                <select
                  v-model="readingMode"
                  class="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="single">单页</option>
                  <option value="double">双页</option>
                  <option value="scroll">滚动</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">方向</h3>
                  <p class="text-sm text-gray-500">设置阅读方向</p>
                </div>
                <select
                  v-model="readingDirection"
                  class="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ltr">从左到右</option>
                  <option value="rtl">从右到左</option>
                  <option value="vertical">垂直</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">缩放模式</h3>
                  <p class="text-sm text-gray-500">设置图片缩放方式</p>
                </div>
                <select
                  v-model="zoomMode"
                  class="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="fit">适应屏幕</option>
                  <option value="width">适应宽度</option>
                  <option value="original">原始大小</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="card">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">显示设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">主题</h3>
                  <p class="text-sm text-gray-500">选择界面主题</p>
                </div>
                <select
                  v-model="theme"
                  class="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">字体大小</h3>
                  <p class="text-sm text-gray-500">设置界面字体大小</p>
                </div>
                <select
                  v-model="fontSize"
                  class="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 存储设置 -->
        <div class="card">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">存储设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">漫画存储位置</h3>
                  <p class="text-sm text-gray-500">设置漫画文件存储路径</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">{{
                    comicStoragePath
                  }}</span>
                  <button
                    @click="changeStoragePath"
                    class="text-primary-600 hover:text-primary-700"
                  >
                    更改
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">缓存管理</h3>
                  <p class="text-sm text-gray-500">管理应用缓存</p>
                </div>
                <button @click="clearCache" class="btn-secondary">
                  清除缓存
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div class="card">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">其他设置</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">自动更新</h3>
                  <p class="text-sm text-gray-500">自动检查应用更新</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="autoUpdate"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                  ></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">数据备份</h3>
                  <p class="text-sm text-gray-500">定期备份阅读数据</p>
                </div>
                <button @click="backupData" class="btn-secondary">
                  备份数据
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4">
          <button @click="resetSettings" class="btn-secondary">重置设置</button>
          <button @click="saveSettings" class="btn-primary">保存设置</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const readingMode = ref('single');
  const readingDirection = ref('ltr');
  const zoomMode = ref('fit');
  const theme = ref('light');
  const fontSize = ref('medium');
  const autoUpdate = ref(false);
  const comicStoragePath = ref('C:/Comics');

  onMounted(() => {
    // TODO: Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      readingMode.value = settings.readingMode || 'single';
      readingDirection.value = settings.readingDirection || 'ltr';
      zoomMode.value = settings.zoomMode || 'fit';
      theme.value = settings.theme || 'light';
      fontSize.value = settings.fontSize || 'medium';
      autoUpdate.value = settings.autoUpdate || false;
      comicStoragePath.value = settings.comicStoragePath || 'C:/Comics';
    }
  });

  const changeStoragePath = () => {
    // TODO: 实现存储路径更改
    alert('存储路径更改功能待实现');
  };

  const clearCache = () => {
    // TODO: 实现缓存清理
    alert('缓存清理功能待实现');
  };

  const backupData = () => {
    // TODO: 实现数据备份
    alert('数据备份功能待实现');
  };

  const resetSettings = () => {
    readingMode.value = 'single';
    readingDirection.value = 'ltr';
    zoomMode.value = 'fit';
    theme.value = 'light';
    fontSize.value = 'medium';
    autoUpdate.value = false;
    comicStoragePath.value = 'C:/Comics';
  };

  const saveSettings = () => {
    const settings = {
      readingMode: readingMode.value,
      readingDirection: readingDirection.value,
      zoomMode: zoomMode.value,
      theme: theme.value,
      fontSize: fontSize.value,
      autoUpdate: autoUpdate.value,
      comicStoragePath: comicStoragePath.value,
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('设置已保存');
  };
</script>
