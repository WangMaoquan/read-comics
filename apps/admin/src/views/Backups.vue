<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import {
    backupsService,
    type Backup,
    type BackupStats,
  } from '../api/services/backupsService';

  // 状态
  const backups = ref<Backup[]>([]);
  const loading = ref(false);
  const showCreateModal = ref(false);

  // 统计数据
  const stats = ref<BackupStats>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    totalSize: 0,
  });

  // 新建备份表单
  const createForm = ref({
    name: '',
    type: 'full' as 'full' | 'incremental',
    description: '',
  });

  // 获取备份列表
  const fetchBackups = async () => {
    loading.value = true;
    try {
      const data = await backupsService.getBackups();
      backups.value = data;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const data = await backupsService.getStats();
      stats.value = data;
    } catch (error) {
      console.error('Failed to fetch backup stats:', error);
    }
  };

  // 初始化
  onMounted(() => {
    fetchBackups();
    fetchStats();
  });

  // 创建备份
  const handleCreateBackup = async () => {
    if (!createForm.value.name) {
      alert('请输入备份名称');
      return;
    }

    try {
      await backupsService.createBackup(createForm.value);
      showCreateModal.value = false;
      createForm.value = { name: '', type: 'full', description: '' };
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('创建备份失败');
    }
  };

  // 删除备份
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此备份吗？')) return;

    try {
      await backupsService.deleteBackup(id);
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('删除备份失败');
    }
  };

  // 恢复备份
  const handleRestore = async (id: string) => {
    if (!confirm('确定要从该备份恢复数据吗？这将覆盖当前数据！')) return;

    try {
      // await backupsService.restoreBackup(id); // 后端尚未实现 restore
      alert('恢复功能尚未在后端实现');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('恢复失败');
    }
  };

  // 辅助函数
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'in_progress':
        return '进行中';
      default:
        return status;
    }
  };
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">数据备份</h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span class="text-xl">+</span>
        创建备份
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总备份数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.total }}
            </p>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span class="text-xl">📦</span>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总大小</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ formatSize(stats.totalSize) }}
            </p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span class="text-xl">💾</span>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">成功</p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ stats.completed }}
            </p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span class="text-xl">✅</span>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">失败</p>
            <p class="text-2xl font-bold text-red-600 mt-1">
              {{ stats.failed }}
            </p>
          </div>
          <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span class="text-xl">❌</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 备份列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-medium">备份名称</th>
              <th class="p-4 font-medium">类型</th>
              <th class="p-4 font-medium">大小</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">创建时间</th>
              <th class="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="p-8 text-gray-500">加载中...</td>
            </tr>
            <tr v-else-if="backups.length === 0" class="text-center">
              <td colspan="6" class="p-8 text-gray-500">暂无备份</td>
            </tr>
            <tr
              v-for="backup in backups"
              :key="backup.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ backup.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ backup.description }}
                </div>
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {{ backup.type === 'full' ? '全量' : '增量' }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatSize(backup.size) }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(backup.status)"
                >
                  {{ getStatusText(backup.status) }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatTime(backup.createdAt) }}
              </td>
              <td class="p-4 text-right space-x-2">
                <button
                  @click="handleRestore(backup.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  :disabled="backup.status !== 'completed'"
                >
                  恢复
                </button>
                <button
                  @click="handleDelete(backup.id)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建备份模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          创建新备份
        </h2>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份名称</label
            >
            <input
              v-model="createForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: backup-2023-11-20"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >备份类型</label
            >
            <select
              v-model="createForm.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full">全量备份</option>
              <option value="incremental">增量备份</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >描述</label
            >
            <textarea
              v-model="createForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleCreateBackup"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始备份
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
