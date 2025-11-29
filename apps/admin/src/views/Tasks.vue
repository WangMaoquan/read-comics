<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {
    tasksService,
    type Task,
    type TaskStats,
  } from '../api/services/tasksService';

  // 状态
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const showCreateModal = ref(false);
  let pollInterval: any = null;

  // 统计数据
  const stats = ref<TaskStats>({
    total: 0,
    running: 0,
    pending: 0,
    completed: 0,
    failed: 0,
  });

  // 新建任务表单
  const createForm = ref({
    name: '',
    type: 'scan' as 'scan' | 'thumbnail' | 'backup' | 'cleanup' | 'import',
    params: {},
  });

  // 获取任务列表
  const fetchTasks = async () => {
    // 只有第一次加载显示 loading，后续轮询不显示
    if (tasks.value.length === 0) loading.value = true;
    try {
      const data = await tasksService.getTasks();
      tasks.value = data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const data = await tasksService.getStats();
      stats.value = data;
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
    }
  };

  // 初始化和轮询
  onMounted(() => {
    fetchTasks();
    fetchStats();
    // 每3秒轮询一次状态
    pollInterval = setInterval(() => {
      fetchTasks();
      fetchStats();
    }, 3000);
  });

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  // 创建任务
  const handleCreateTask = async () => {
    if (!createForm.value.name) {
      alert('请输入任务名称');
      return;
    }

    try {
      await tasksService.createTask(createForm.value);
      showCreateModal.value = false;
      createForm.value = { name: '', type: 'scan', params: {} };
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('创建任务失败');
    }
  };

  // 任务操作
  const handleCancel = async (id: string) => {
    try {
      await tasksService.cancelTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await tasksService.retryTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to retry task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此任务记录吗？')) return;
    try {
      await tasksService.deleteTask(id);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleClearCompleted = async () => {
    if (!confirm('确定要清除所有已完成的任务记录吗？')) return;
    try {
      await tasksService.clearCompleted();
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
    }
  };

  // 辅助函数
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      completed: '已完成',
      failed: '失败',
      running: '运行中',
      pending: '等待中',
      cancelled: '已取消',
    };
    return map[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      scan: '库扫描',
      thumbnail: '生成缩略图',
      backup: '系统备份',
      cleanup: '清理缓存',
      import: '批量导入',
    };
    return map[type] || type;
  };
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">任务队列</h1>
      <div class="flex gap-3">
        <button
          @click="handleClearCompleted"
          class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          清除已完成
        </button>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span class="text-xl">+</span>
          新建任务
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总任务</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.total }}
            </p>
          </div>
          <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span class="text-xl">📋</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">运行中</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">
              {{ stats.running }}
            </p>
          </div>
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span class="text-xl animate-spin">⚡</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">等待中</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">
              {{ stats.pending }}
            </p>
          </div>
          <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span class="text-xl">⏳</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">已完成</p>
            <p class="text-2xl font-bold text-green-600 mt-1">
              {{ stats.completed }}
            </p>
          </div>
          <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span class="text-xl">✅</span>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">失败</p>
            <p class="text-2xl font-bold text-red-600 mt-1">
              {{ stats.failed }}
            </p>
          </div>
          <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span class="text-xl">❌</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-medium">任务名称</th>
              <th class="p-4 font-medium">类型</th>
              <th class="p-4 font-medium">进度</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">开始时间</th>
              <th class="p-4 font-medium">耗时</th>
              <th class="p-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading && tasks.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-gray-500">加载中...</td>
            </tr>
            <tr v-else-if="tasks.length === 0" class="text-center">
              <td colspan="7" class="p-8 text-gray-500">暂无任务</td>
            </tr>
            <tr
              v-for="task in tasks"
              :key="task.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ task.name }}
                </div>
                <div
                  v-if="task.error"
                  class="text-xs text-red-500 mt-1 truncate max-w-xs"
                  :title="task.error"
                >
                  {{ task.error }}
                </div>
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ getTypeLabel(task.type) }}
              </td>
              <td class="p-4 w-48">
                <div class="flex items-center gap-2">
                  <div
                    class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-blue-600 transition-all duration-500"
                      :style="{ width: `${task.progress}%` }"
                      :class="{
                        'bg-green-500': task.status === 'completed',
                        'bg-red-500': task.status === 'failed',
                      }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500 w-8 text-right"
                    >{{ task.progress }}%</span
                  >
                </div>
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(task.status)"
                >
                  {{ getStatusText(task.status) }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatTime(task.startTime) }}
              </td>
              <td class="p-4 text-sm text-gray-500 dark:text-gray-400">
                {{
                  task.endTime && task.startTime
                    ? Math.round(
                        (new Date(task.endTime).getTime() -
                          new Date(task.startTime).getTime()) /
                          1000,
                      ) + 's'
                    : '-'
                }}
              </td>
              <td class="p-4 text-right space-x-2">
                <button
                  v-if="task.status === 'running' || task.status === 'pending'"
                  @click="handleCancel(task.id)"
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  v-if="task.status === 'failed' || task.status === 'cancelled'"
                  @click="handleRetry(task.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  重试
                </button>
                <button
                  @click="handleDelete(task.id)"
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

    <!-- 创建任务模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          新建任务
        </h2>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >任务名称</label
            >
            <input
              v-model="createForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 扫描新漫画"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >任务类型</label
            >
            <select
              v-model="createForm.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scan">库扫描</option>
              <option value="thumbnail">生成缩略图</option>
              <option value="backup">系统备份</option>
              <option value="cleanup">清理缓存</option>
              <option value="import">批量导入</option>
            </select>
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
            @click="handleCreateTask"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建任务
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
