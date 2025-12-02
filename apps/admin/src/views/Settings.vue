<script setup lang="ts">
  import { ref } from 'vue';

  // 设置分类
  const activeTab = ref('general');

  const tabs = [
    { id: 'general', name: '基础设置', icon: '⚙️' },
    { id: 'storage', name: '存储设置', icon: '💾' },
    { id: 'reading', name: '阅读设置', icon: '📖' },
    { id: 'security', name: '安全设置', icon: '🔒' },
  ];

  // 设置数据
  const settings = ref({
    // 基础设置
    general: {
      siteName: 'Comics Admin',
      siteDescription: '漫画管理系统',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
    },

    // 存储设置
    storage: {
      comicPath: '/var/comics',
      cachePath: '/var/cache/comics',
      thumbnailPath: '/var/cache/thumbnails',
      maxFileSize: 500, // MB
      autoCleanup: true,
      cleanupDays: 30,
    },

    // 阅读设置
    reading: {
      defaultMode: 'single',
      imageQuality: 'high',
      preloadPages: 3,
      enableCache: true,
      defaultZoom: 'fit',
    },

    // 安全设置
    security: {
      enableRegistration: false,
      minPasswordLength: 8,
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
    },
  });

  const saving = ref(false);

  // 保存设置
  const saveSettings = async () => {
    saving.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 保存到 localStorage（临时）
      localStorage.setItem('admin_settings', JSON.stringify(settings.value));

      alert('设置已保存');
    } catch (error) {
      alert('保存失败');
    } finally {
      saving.value = false;
    }
  };

  // 重置设置
  const resetSettings = () => {
    if (!confirm('确定要重置所有设置为默认值吗？')) return;

    // 恢复默认值
    settings.value = {
      general: {
        siteName: 'Comics Admin',
        siteDescription: '漫画管理系统',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
      },
      storage: {
        comicPath: '/var/comics',
        cachePath: '/var/cache/comics',
        thumbnailPath: '/var/cache/thumbnails',
        maxFileSize: 500,
        autoCleanup: true,
        cleanupDays: 30,
      },
      reading: {
        defaultMode: 'single',
        imageQuality: 'high',
        preloadPages: 3,
        enableCache: true,
        defaultZoom: 'fit',
      },
      security: {
        enableRegistration: false,
        minPasswordLength: 8,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
      },
    };
  };

  // 测试路径
  const testPath = async (path: string) => {
    alert(`测试路径: ${path}\n（模拟功能）`);
  };
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      系统设置
    </h1>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 侧边栏导航 -->
      <div class="lg:w-64 shrink-0">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              activeTab === tab.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
            ]"
          >
            <span class="text-xl">{{ tab.icon }}</span>
            <span>{{ tab.name }}</span>
          </button>
        </div>
      </div>

      <!-- 设置内容 -->
      <div class="flex-1">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <!-- 基础设置 -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              基础设置
            </h2>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >网站名称</label
              >
              <input
                v-model="settings.general.siteName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >网站描述</label
              >
              <textarea
                v-model="settings.general.siteDescription"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >时区</label
              >
              <select
                v-model="settings.general.timezone"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">
                  America/New_York (UTC-5)
                </option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >语言</label
              >
              <select
                v-model="settings.general.language"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>

          <!-- 存储设置 -->
          <div v-if="activeTab === 'storage'" class="space-y-6">
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              存储设置
            </h2>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >漫画存储路径</label
              >
              <div class="flex gap-2">
                <input
                  v-model="settings.storage.comicPath"
                  type="text"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  @click="testPath(settings.storage.comicPath)"
                  class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  测试
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">漫画文件的存储位置</p>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >缓存路径</label
              >
              <input
                v-model="settings.storage.cachePath"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >缩略图路径</label
              >
              <input
                v-model="settings.storage.thumbnailPath"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >最大文件大小 (MB)</label
              >
              <input
                v-model.number="settings.storage.maxFileSize"
                type="number"
                min="1"
                max="5000"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p class="text-xs text-gray-500 mt-1">单个文件最大允许上传大小</p>
            </div>

            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  自动清理缓存
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  定期清理过期的缓存文件
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.storage.autoCleanup"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>

            <div v-if="settings.storage.autoCleanup">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >清理周期（天）</label
              >
              <input
                v-model.number="settings.storage.cleanupDays"
                type="number"
                min="1"
                max="365"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <!-- 阅读设置 -->
          <div v-if="activeTab === 'reading'" class="space-y-6">
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              阅读设置
            </h2>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >默认阅读模式</label
              >
              <select
                v-model="settings.reading.defaultMode"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="single">单页模式</option>
                <option value="double">双页模式</option>
                <option value="scroll">滚动模式</option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >图片质量</label
              >
              <select
                v-model="settings.reading.imageQuality"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">低 (快速加载)</option>
                <option value="medium">中 (平衡)</option>
                <option value="high">高 (最佳质量)</option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >默认缩放模式</label
              >
              <select
                v-model="settings.reading.defaultZoom"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="fit">适应屏幕</option>
                <option value="width">适应宽度</option>
                <option value="original">原始大小</option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >预加载页数</label
              >
              <input
                v-model.number="settings.reading.preloadPages"
                type="number"
                min="0"
                max="10"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p class="text-xs text-gray-500 mt-1">
                提前加载的页面数量，提升阅读流畅度
              </p>
            </div>

            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  启用图片缓存
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  缓存已查看的图片以提升性能
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.reading.enableCache"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>
          </div>

          <!-- 安全设置 -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            >
              安全设置
            </h2>

            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  允许用户注册
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  开放新用户注册功能
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.security.enableRegistration"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >最小密码长度</label
              >
              <input
                v-model.number="settings.security.minPasswordLength"
                type="number"
                min="6"
                max="32"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >会话超时时间（分钟）</label
              >
              <input
                v-model.number="settings.security.sessionTimeout"
                type="number"
                min="5"
                max="1440"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p class="text-xs text-gray-500 mt-1">
                用户无操作后自动登出的时长
              </p>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >最大登录尝试次数</label
              >
              <input
                v-model.number="settings.security.maxLoginAttempts"
                type="number"
                min="3"
                max="10"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p class="text-xs text-gray-500 mt-1">超过次数后临时锁定账户</p>
            </div>

            <div
              class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
            >
              <div class="flex gap-3">
                <span class="text-2xl">⚠️</span>
                <div>
                  <p class="font-medium text-yellow-900 dark:text-yellow-200">
                    安全提示
                  </p>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    修改安全设置可能影响系统访问控制，请谨慎操作。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div
            class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              @click="resetSettings"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              重置为默认
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="saving"
                class="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ saving ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
