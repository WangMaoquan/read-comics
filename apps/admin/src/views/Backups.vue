<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface Backup {
    id: string;
    name: string;
    type: 'full' | 'incremental';
    size: number; // bytes
    status: 'completed' | 'failed' | 'in_progress';
    createdAt: Date;
    description?: string;
  }

  // Mock 备份数据
  const backups = ref<Backup[]>([
    {
      id: '1',
      name: 'backup-2024-01-29-full',
      type: 'full',
      size: 1234567890, // ~1.15 GB
      status: 'completed',
      createdAt: new Date('2024-01-29T02:00:00'),
      description: '自动定时备份',
    },
    {
      id: '2',
      name: 'backup-2024-01-28-incremental',
      type: 'incremental',
      size: 123456789, // ~117.7 MB
      status: 'completed',
      createdAt: new Date('2024-01-28T02:00:00'),
    },
    {
      id: '3',
      name: 'backup-2024-01-27-full',
      type: 'full',
      size: 1123456789,
      status: 'completed',
      createdAt: new Date('2024-01-27T02:00:00'),
    },
  ]);

  // 状态
  const loading = ref(false);
  const backupProgress = ref(0);
  const isBackingUp = ref(false);
  const showCreateModal = ref(false);
  const showScheduleModal = ref(false);

  // 创建备份表单
  const backupForm = ref({
    name: '',
    type: 'full' as 'full' | 'incremental',
    includeDatabase: true,
    includeFiles: true,
    includeConfig: true,
  });

  // 定时备份设置
  const scheduleSettings = ref({
    enabled: false,
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    keepCount: 7,
    type: 'full' as 'full' | 'incremental',
  });

  // 计算属性
  const totalBackupSize = computed(() => {
    return backups.value.reduce((sum, b) => sum + b.size, 0);
  });

  // 辅助函数
  const formatSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      completed:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      in_progress:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[status as keyof typeof colors] || '';
  };

  const getTypeColor = (type: string): string => {
    return type === 'full'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  // 操作
  const createBackup = async () => {
    if (!backupForm.value.name) {
      alert('请输入备份名称');
      return;
    }

    isBackingUp.value = true;
    backupProgress.value = 0;

    // 模拟备份进度
    const interval = setInterval(() => {
      backupProgress.value += 10;
      if (backupProgress.value >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // 添加新备份
          backups.value.unshift({
            id: Date.now().toString(),
            name: backupForm.value.name,
            type: backupForm.value.type,
            size: Math.floor(Math.random() * 1000000000) + 100000000,
            status: 'completed',
            createdAt: new Date(),
          });

          isBackingUp.value = false;
          backupProgress.value = 0;
          showCreateModal.value = false;
          backupForm.value.name = '';
          alert('备份创建成功！');
        }, 500);
      }
    }, 300);
  };

  const downloadBackup = async (backup: Backup) => {
    alert(
      `下载备份: ${backup.name}\n大小: ${formatSize(backup.size)}\n（模拟功能）`,
    );
  };

  const deleteBackup = async (id: string) => {
    if (!confirm('确定要删除此备份吗？此操作不可恢复！')) return;

    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      backups.value = backups.value.filter((b) => b.id !== id);
      alert('备份已删除');
    } finally {
      loading.value = false;
    }
  };

  const restoreBackup = async (backup: Backup) => {
    if (!confirm(`确定要恢复此备份吗？\n${backup.name}\n当前数据将被覆盖！`))
      return;

    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('恢复成功！请重新加载页面。');
    } finally {
      loading.value = false;
    }
  };

  const saveSchedule = async () => {
    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem(
        'backup_schedule',
        JSON.stringify(scheduleSettings.value),
      );
      showScheduleModal.value = false;
      alert('定时备份设置已保存');
    } finally {
      loading.value = false;
    }
  };

  // 生成默认备份名称
  const generateBackupName = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const type = backupForm.value.type;
    backupForm.value.name = `backup-${date}-${type}`;
  };
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      备份与恢复
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">备份总数</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {{ backups.length }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">总占用空间</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          {{ formatSize(totalBackupSize) }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">最近备份</p>
        <p class="text-lg font-medium text-gray-900 dark:text-white mt-2">
          {{
            backups.length > 0
              ? formatDate(backups[0].createdAt).split(' ')[0]
              : '-'
          }}
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        创建备份
      </button>
      <button
        @click="showScheduleModal = true"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        定时备份设置
      </button>
    </div>

    <!-- 备份进度 -->
    <div
      v-if="isBackingUp"
      class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-blue-900 dark:text-blue-300"
          >正在创建备份...</span
        >
        <span class="text-sm font-medium text-blue-900 dark:text-blue-300"
          >{{ backupProgress }}%</span
        >
      </div>
      <div class="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: backupProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- 备份列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr class="text-left text-sm text-gray-600 dark:text-gray-400">
              <th class="p-4">备份名称</th>
              <th class="p-4">类型</th>
              <th class="p-4">大小</th>
              <th class="p-4">状态</th>
              <th class="p-4">创建时间</th>
              <th class="p-4">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="backup in backups"
              :key="backup.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ backup.name }}
                  </p>
                  <p
                    v-if="backup.description"
                    class="text-xs text-gray-500 mt-1"
                  >
                    {{ backup.description }}
                  </p>
                </div>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getTypeColor(backup.type),
                  ]"
                >
                  {{ backup.type === 'full' ? '完整备份' : '增量备份' }}
                </span>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-400">
                {{ formatSize(backup.size) }}
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getStatusColor(backup.status),
                  ]"
                >
                  {{
                    backup.status === 'completed'
                      ? '已完成'
                      : backup.status === 'failed'
                        ? '失败'
                        : '进行中'
                  }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(backup.createdAt) }}
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    @click="downloadBackup(backup)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    下载
                  </button>
                  <button
                    @click="restoreBackup(backup)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    恢复
                  </button>
                  <button
                    @click="deleteBackup(backup.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="backups.length === 0" class="p-12 text-center">
        <p class="text-gray-500">暂无备份记录</p>
        <button
          @click="showCreateModal = true"
          class="mt-4 text-blue-600 hover:text-blue-800"
        >
          创建第一个备份
        </button>
      </div>
    </div>

    <!-- 创建备份模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          创建备份
        </h2>

        <form @submit.prevent="createBackup" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份名称</label
            >
            <div class="flex gap-2">
              <input
                v-model="backupForm.name"
                type="text"
                required
                placeholder="backup-2024-01-29-full"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                @click="generateBackupName"
                class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                自动生成
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份类型</label
            >
            <select
              v-model="backupForm.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="full">完整备份（包含所有数据）</option>
              <option value="incremental">增量备份（仅备份变更）</option>
            </select>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >包含内容</label
            >
            <label class="flex items-center gap-2">
              <input
                v-model="backupForm.includeDatabase"
                type="checkbox"
                class="rounded border-gray-300 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >数据库</span
              >
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="backupForm.includeFiles"
                type="checkbox"
                class="rounded border-gray-300 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >用户上传文件</span
              >
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="backupForm.includeConfig"
                type="checkbox"
                class="rounded border-gray-300 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >配置文件</span
              >
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isBackingUp"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              开始备份
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 定时备份设置模态框 -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          定时备份设置
        </h2>

        <form @submit.prevent="saveSchedule" class="space-y-4">
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                启用定时备份
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                自动定期备份数据
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="scheduleSettings.enabled"
                type="checkbox"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div v-if="scheduleSettings.enabled">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份频率</label
            >
            <select
              v-model="scheduleSettings.frequency"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>

          <div v-if="scheduleSettings.enabled">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份时间</label
            >
            <input
              v-model="scheduleSettings.time"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div v-if="scheduleSettings.enabled">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >保留备份数量</label
            >
            <input
              v-model.number="scheduleSettings.keepCount"
              type="number"
              min="1"
              max="30"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">
              超过数量将自动删除最旧的备份
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showScheduleModal = false"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
