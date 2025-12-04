<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { logsService } from '../api/client';
  import type { SystemLog, LogStats } from '@read-comics/api-client';

  // 状态
  const logs = ref<SystemLog[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 统计数据
  const stats = ref<LogStats>({
    total: 0,
    info: 0,
    warn: 0,
    error: 0,
    debug: 0,
  });

  // 过滤条件
  const filters = ref({
    search: '',
    level: '',
    module: '',
    dateRange: [] as string[],
  });

  // 获取日志列表
  const fetchLogs = async () => {
    loading.value = true;
    try {
      const params: any = {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: filters.value.search,
        level: filters.value.level,
        module: filters.value.module,
      };

      if (filters.value.dateRange?.length === 2) {
        params.startDate = filters.value.dateRange[0];
        params.endDate = filters.value.dateRange[1];
      }

      const response = await logsService.getLogs(params);
      logs.value = response.data;
      total.value = response.total;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const data = await logsService.getStats();
      stats.value = data;
    } catch (error) {
      console.error('Failed to fetch log stats:', error);
    }
  };

  // 初始化
  onMounted(() => {
    fetchLogs();
    fetchStats();
  });

  // 监听过滤条件变化
  watch(
    filters,
    () => {
      currentPage.value = 1;
      fetchLogs();
    },
    { deep: true },
  );

  // 分页变化
  const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchLogs();
  };

  // 清空日志
  const handleClearLogs = async () => {
    if (!confirm('确定要清空所有日志吗？此操作不可恢复。')) return;

    try {
      await logsService.clearLogs();
      fetchLogs();
      fetchStats();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  // 导出日志 (模拟)
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Time,Level,Module,Message,User\n' +
      logs.value
        .map(
          (log) =>
            `${log.createdAt},${log.level},${log.module},"${log.message}",${log.username || '-'}`,
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `system_logs_${new Date().toISOString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 辅助函数
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'debug':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString();
  };
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      系统日志
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总日志数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.total }}
            </p>
          </div>
          <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span class="text-xl">📝</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">错误</p>
            <p class="text-2xl font-bold text-red-600 mt-1">
              {{ stats.error }}
            </p>
          </div>
          <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span class="text-xl">❌</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">警告</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">
              {{ stats.warn }}
            </p>
          </div>
          <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span class="text-xl">⚠️</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">信息</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ stats.info }}
            </p>
          </div>
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span class="text-xl">ℹ️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤器和操作 -->
    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
    >
      <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="flex flex-wrap gap-4 flex-1">
          <input
            v-model="filters.search"
            type="text"
            placeholder="搜索日志..."
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            v-model="filters.level"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有级别</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <select
            v-model="filters.module"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有模块</option>
            <option value="auth">Auth</option>
            <option value="system">System</option>
            <option value="comics">Comics</option>
            <option value="files">Files</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            @click="handleExport"
            class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            导出
          </button>
          <button
            @click="handleClearLogs"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            清空
          </button>
        </div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-medium">时间</th>
              <th class="p-4 font-medium">级别</th>
              <th class="p-4 font-medium">模块</th>
              <th class="p-4 font-medium">消息</th>
              <th class="p-4 font-medium">用户</th>
              <th class="p-4 font-medium">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="p-8 text-gray-500">加载中...</td>
            </tr>
            <tr v-else-if="logs.length === 0" class="text-center">
              <td colspan="6" class="p-8 text-gray-500">暂无日志</td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td
                class="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                {{ formatTime(log.createdAt) }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getLevelColor(log.level)"
                >
                  {{ log.level.toUpperCase() }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-900 dark:text-white">
                {{ log.module }}
              </td>
              <td
                class="p-4 text-sm text-gray-900 dark:text-white max-w-md truncate"
                :title="log.message"
              >
                {{ log.message }}
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ log.username || '-' }}
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ log.ip || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div
        class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ total }} 条记录
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            上一页
          </button>
          <span class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
            {{ currentPage }}
          </span>
          <button
            :disabled="currentPage * pageSize >= total"
            @click="handlePageChange(currentPage + 1)"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
