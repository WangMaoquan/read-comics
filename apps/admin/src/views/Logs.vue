<script setup lang="ts">
  import { ref, computed } from 'vue';

  // 日志级别类型
  type LogLevel = 'info' | 'warn' | 'error' | 'debug';

  interface SystemLog {
    id: string;
    level: LogLevel;
    message: string;
    module: string;
    userId?: string;
    username?: string;
    ip?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }

  // Mock 日志数据
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      level: 'info',
      message: '用户登录成功',
      module: 'auth',
      userId: 'user-1',
      username: 'admin',
      ip: '192.168.1.100',
      timestamp: new Date('2024-01-29T10:30:00'),
    },
    {
      id: '2',
      level: 'warn',
      message: '存储空间使用率达到 85%',
      module: 'storage',
      timestamp: new Date('2024-01-29T10:25:00'),
    },
    {
      id: '3',
      level: 'error',
      message: '文件上传失败：文件大小超过限制',
      module: 'files',
      userId: 'user-2',
      username: 'editor',
      ip: '192.168.1.101',
      timestamp: new Date('2024-01-29T10:20:00'),
      metadata: { filename: 'large-comic.zip', size: '600MB' },
    },
    {
      id: '4',
      level: 'info',
      message: '漫画扫描任务完成',
      module: 'scan',
      timestamp: new Date('2024-01-29T10:15:00'),
      metadata: { found: 5, processed: 5 },
    },
    {
      id: '5',
      level: 'debug',
      message: 'API 请求: GET /api/comics',
      module: 'api',
      userId: 'user-1',
      ip: '192.168.1.100',
      timestamp: new Date('2024-01-29T10:10:00'),
    },
    {
      id: '6',
      level: 'error',
      message: '数据库连接超时',
      module: 'database',
      timestamp: new Date('2024-01-29T10:05:00'),
    },
    {
      id: '7',
      level: 'warn',
      message: 'API 响应时间过长: 3.2s',
      module: 'performance',
      timestamp: new Date('2024-01-29T10:00:00'),
    },
    {
      id: '8',
      level: 'info',
      message: '缓存清理完成',
      module: 'maintenance',
      timestamp: new Date('2024-01-29T09:55:00'),
      metadata: { cleaned: '1.2GB' },
    },
  ];

  // 状态
  const logs = ref<SystemLog[]>(mockLogs);
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedLevel = ref<LogLevel | 'all'>('all');
  const selectedModule = ref<string>('all');
  const startDate = ref('');
  const endDate = ref('');
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 可用的模块列表
  const modules = computed(() => {
    const moduleSet = new Set(logs.value.map((log) => log.module));
    return ['all', ...Array.from(moduleSet)];
  });

  // 过滤后的日志
  const filteredLogs = computed(() => {
    let result = logs.value;

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.module.toLowerCase().includes(query) ||
          log.username?.toLowerCase().includes(query),
      );
    }

    // 级别过滤
    if (selectedLevel.value !== 'all') {
      result = result.filter((log) => log.level === selectedLevel.value);
    }

    // 模块过滤
    if (selectedModule.value !== 'all') {
      result = result.filter((log) => log.module === selectedModule.value);
    }

    // 日期过滤
    if (startDate.value) {
      const start = new Date(startDate.value);
      result = result.filter((log) => new Date(log.timestamp) >= start);
    }
    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59);
      result = result.filter((log) => new Date(log.timestamp) <= end);
    }

    return result;
  });

  // 分页
  const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredLogs.value.slice(start, end);
  });

  const totalPages = computed(() =>
    Math.ceil(filteredLogs.value.length / pageSize.value),
  );

  // 统计
  const stats = computed(() => {
    const total = logs.value.length;
    const info = logs.value.filter((l) => l.level === 'info').length;
    const warn = logs.value.filter((l) => l.level === 'warn').length;
    const error = logs.value.filter((l) => l.level === 'error').length;
    const debug = logs.value.filter((l) => l.level === 'debug').length;

    return { total, info, warn, error, debug };
  });

  // 辅助函数
  const getLevelColor = (level: LogLevel): string => {
    const colors = {
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      debug: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[level];
  };

  const getLevelIcon = (level: LogLevel): string => {
    const icons = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    };
    return icons[level];
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleString('zh-CN');
  };

  // 操作
  const refreshLogs = async () => {
    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // TODO: API 调用
    } finally {
      loading.value = false;
    }
  };

  const exportLogs = () => {
    const data = filteredLogs.value.map((log) => ({
      时间: formatTime(log.timestamp),
      级别: log.level,
      模块: log.module,
      消息: log.message,
      用户: log.username || '-',
      IP: log.ip || '-',
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearLogs = async () => {
    if (!confirm('确定要清空所有日志吗？此操作不可恢复！')) return;

    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logs.value = [];
      alert('日志已清空');
    } finally {
      loading.value = false;
    }
  };

  const resetFilters = () => {
    searchQuery.value = '';
    selectedLevel.value = 'all';
    selectedModule.value = 'all';
    startDate.value = '';
    endDate.value = '';
    currentPage.value = 1;
  };
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      系统日志
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">总计</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ stats.total }}
        </p>
      </div>
      <div
        class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <p class="text-sm text-blue-600 dark:text-blue-400">Info</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
          {{ stats.info }}
        </p>
      </div>
      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
      >
        <p class="text-sm text-yellow-600 dark:text-yellow-400">Warn</p>
        <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
          {{ stats.warn }}
        </p>
      </div>
      <div
        class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
      >
        <p class="text-sm text-red-600 dark:text-red-400">Error</p>
        <p class="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
          {{ stats.error }}
        </p>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">Debug</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ stats.debug }}
        </p>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- 搜索 -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索日志..."
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <!-- 级别过滤 -->
        <select
          v-model="selectedLevel"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">所有级别</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>

        <!-- 模块过滤 -->
        <select
          v-model="selectedModule"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option v-for="module in modules" :key="module" :value="module">
            {{ module === 'all' ? '所有模块' : module }}
          </option>
        </select>

        <!-- 日期范围 -->
        <div class="flex gap-2">
          <input
            v-model="startDate"
            type="date"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            v-model="endDate"
            type="date"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
        >
          重置过滤
        </button>
        <button
          @click="refreshLogs"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': loading }"
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
          刷新
        </button>
        <button
          @click="exportLogs"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          导出 CSV
        </button>
        <button
          @click="clearLogs"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          清空日志
        </button>
      </div>
    </div>

    <!-- 日志列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr class="text-left text-sm text-gray-600 dark:text-gray-400">
              <th class="p-4">级别</th>
              <th class="p-4">时间</th>
              <th class="p-4">模块</th>
              <th class="p-4">消息</th>
              <th class="p-4">用户</th>
              <th class="p-4">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit',
                    getLevelColor(log.level),
                  ]"
                >
                  <span>{{ getLevelIcon(log.level) }}</span>
                  <span class="uppercase">{{ log.level }}</span>
                </span>
              </td>
              <td
                class="p-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
              >
                {{ formatTime(log.timestamp) }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {{ log.module }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-900 dark:text-white max-w-md">
                {{ log.message }}
                <div v-if="log.metadata" class="text-xs text-gray-500 mt-1">
                  {{ JSON.stringify(log.metadata) }}
                </div>
              </td>
              <td class="p-4 text-sm text-gray-600 dark:text-gray-400">
                {{ log.username || '-' }}
              </td>
              <td
                class="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono"
              >
                {{ log.ip || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          显示 {{ (currentPage - 1) * pageSize + 1 }} -
          {{ Math.min(currentPage * pageSize, filteredLogs.length) }} 共
          {{ filteredLogs.length }} 条
        </p>
        <div class="flex gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredLogs.length === 0" class="p-12 text-center">
        <p class="text-gray-500">暂无日志记录</p>
      </div>
    </div>
  </div>
</template>
