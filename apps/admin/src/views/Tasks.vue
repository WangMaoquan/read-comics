<script setup lang="ts">
  import { ref, computed } from 'vue';

  type TaskType = 'scan' | 'thumbnail' | 'backup' | 'cleanup' | 'import';
  type TaskStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled';

  interface Task {
    id: string;
    name: string;
    type: TaskType;
    status: TaskStatus;
    progress: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
    result?: {
      processed?: number;
      found?: number;
      failed?: number;
      message?: string;
    };
  }

  // Mock 任务数据
  const tasks = ref<Task[]>([
    {
      id: '1',
      name: '扫描新漫画',
      type: 'scan',
      status: 'running',
      progress: 65,
      startTime: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      name: '生成缩略图',
      type: 'thumbnail',
      status: 'pending',
      progress: 0,
    },
    {
      id: '3',
      name: '数据备份',
      type: 'backup',
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 25 * 60 * 1000),
      result: { message: '备份成功：1.2GB' },
    },
    {
      id: '4',
      name: '清理缓存文件',
      type: 'cleanup',
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(Date.now() - 58 * 60 * 1000),
      result: { message: '清理完成：2.3GB' },
    },
    {
      id: '5',
      name: '导入漫画文件',
      type: 'import',
      status: 'failed',
      progress: 45,
      startTime: new Date(Date.now() - 90 * 60 * 1000),
      endTime: new Date(Date.now() - 85 * 60 * 1000),
      error: '文件格式不支持',
      result: { processed: 5, found: 12, failed: 7 },
    },
  ]);

  // 状态
  const loading = ref(false);
  const showCreateModal = ref(false);

  // 新建任务表单
  const taskForm = ref({
    name: '',
    type: 'scan' as TaskType,
    params: {},
  });

  // 任务类型配置
  const taskTypes = [
    {
      value: 'scan',
      label: '扫描新漫画',
      icon: '🔍',
      description: '扫描指定目录查找新漫画文件',
    },
    {
      value: 'thumbnail',
      label: '生成缩略图',
      icon: '🖼️',
      description: '为漫画生成缩略图以提升浏览速度',
    },
    {
      value: 'backup',
      label: '数据备份',
      icon: '💾',
      description: '备份数据库和文件',
    },
    {
      value: 'cleanup',
      label: '清理缓存',
      icon: '🧹',
      description: '清理过期的缓存文件',
    },
    {
      value: 'import',
      label: '导入漫画',
      icon: '📥',
      description: '从指定路径导入漫画文件',
    },
  ];

  // 统计
  const stats = computed(() => {
    const total = tasks.value.length;
    const running = tasks.value.filter((t) => t.status === 'running').length;
    const pending = tasks.value.filter((t) => t.status === 'pending').length;
    const completed = tasks.value.filter(
      (t) => t.status === 'completed',
    ).length;
    const failed = tasks.value.filter((t) => t.status === 'failed').length;

    return { total, running, pending, completed, failed };
  });

  // 辅助函数
  const getStatusColor = (status: TaskStatus): string => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      running:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status];
  };

  const getStatusText = (status: TaskStatus): string => {
    const texts = {
      pending: '等待中',
      running: '运行中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
    };
    return texts[status];
  };

  const getTypeIcon = (type: TaskType): string => {
    const task = taskTypes.find((t) => t.value === type);
    return task?.icon || '📋';
  };

  const formatDuration = (start?: Date, end?: Date): string => {
    if (!start) return '-';
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  const formatTime = (date?: Date): string => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('zh-CN');
  };

  // 操作
  const createTask = async () => {
    if (!taskForm.value.name) {
      alert('请输入任务名称');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: taskForm.value.name,
      type: taskForm.value.type,
      status: 'pending',
      progress: 0,
    };

    tasks.value.unshift(newTask);
    showCreateModal.value = false;
    taskForm.value.name = '';

    // 自动开始任务
    setTimeout(() => {
      startTask(newTask.id);
    }, 500);
  };

  const startTask = (id: string) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task || task.status === 'running') return;

    task.status = 'running';
    task.startTime = new Date();
    task.progress = 0;

    // 模拟任务进度
    const interval = setInterval(() => {
      if (task.progress >= 100) {
        clearInterval(interval);
        task.status = 'completed';
        task.endTime = new Date();
        task.result = { message: '任务执行成功' };
        return;
      }
      task.progress += Math.floor(Math.random() * 15) + 5;
      if (task.progress > 100) task.progress = 100;
    }, 1000);
  };

  const cancelTask = (id: string) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task || task.status !== 'running') return;

    task.status = 'cancelled';
    task.endTime = new Date();
  };

  const retryTask = (id: string) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;

    task.status = 'pending';
    task.progress = 0;
    task.error = undefined;
    delete task.endTime;

    setTimeout(() => startTask(id), 500);
  };

  const deleteTask = (id: string) => {
    if (!confirm('确定要删除此任务吗？')) return;
    tasks.value = tasks.value.filter((t) => t.id !== id);
  };

  const clearCompleted = () => {
    if (!confirm('确定要清除所有已完成的任务吗？')) return;
    tasks.value = tasks.value.filter((t) => t.status !== 'completed');
  };
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      任务管理
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">总任务</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ stats.total }}
        </p>
      </div>
      <div
        class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <p class="text-sm text-blue-600 dark:text-blue-400">运行中</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
          {{ stats.running }}
        </p>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">等待中</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ stats.pending }}
        </p>
      </div>
      <div
        class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
      >
        <p class="text-sm text-green-600 dark:text-green-400">已完成</p>
        <p class="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
          {{ stats.completed }}
        </p>
      </div>
      <div
        class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
      >
        <p class="text-sm text-red-600 dark:text-red-400">失败</p>
        <p class="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
          {{ stats.failed }}
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3 mb-6">
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
        新建任务
      </button>
      <button
        @click="clearCompleted"
        class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
      >
        清除已完成
      </button>
    </div>

    <!-- 任务列表 -->
    <div class="space-y-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3 flex-1">
            <span class="text-3xl">{{ getTypeIcon(task.type) }}</span>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ task.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ taskTypes.find((t) => t.value === task.type)?.label }}
              </p>
            </div>
          </div>
          <span
            :class="[
              'px-3 py-1 text-sm rounded-full',
              getStatusColor(task.status),
            ]"
          >
            {{ getStatusText(task.status) }}
          </span>
        </div>

        <!-- 进度条 -->
        <div
          v-if="task.status === 'running' || task.status === 'pending'"
          class="mb-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">进度</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white"
              >{{ task.progress }}%</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: task.progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div
          v-if="task.error"
          class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p class="text-sm text-red-700 dark:text-red-400">
            ❌ {{ task.error }}
          </p>
        </div>

        <!-- 结果信息 -->
        <div
          v-if="task.result && task.status === 'completed'"
          class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <p class="text-sm text-green-700 dark:text-green-400">
            ✅ {{ task.result.message }}
          </p>
          <div
            v-if="task.result.processed !== undefined"
            class="text-xs text-green-600 dark:text-green-500 mt-1"
          >
            处理: {{ task.result.processed }} / 发现: {{ task.result.found }} /
            失败: {{ task.result.failed || 0 }}
          </div>
        </div>

        <!-- 时间信息 -->
        <div
          class="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4"
        >
          <span>开始: {{ formatTime(task.startTime) }}</span>
          <span v-if="task.endTime">结束: {{ formatTime(task.endTime) }}</span>
          <span v-if="task.startTime"
            >耗时: {{ formatDuration(task.startTime, task.endTime) }}</span
          >
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button
            v-if="task.status === 'running'"
            @click="cancelTask(task.id)"
            class="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            v-if="task.status === 'failed'"
            @click="retryTask(task.id)"
            class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重试
          </button>
          <button
            v-if="
              task.status === 'completed' ||
              task.status === 'failed' ||
              task.status === 'cancelled'
            "
            @click="deleteTask(task.id)"
            class="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
          >
            删除
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="tasks.length === 0"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center"
      >
        <p class="text-gray-500">暂无任务</p>
        <button
          @click="showCreateModal = true"
          class="mt-4 text-blue-600 hover:text-blue-800"
        >
          创建第一个任务
        </button>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          新建任务
        </h2>

        <form @submit.prevent="createTask" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >任务名称</label
            >
            <input
              v-model="taskForm.name"
              type="text"
              required
              placeholder="例如：扫描新漫画"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >任务类型</label
            >
            <div class="space-y-2">
              <label
                v-for="type in taskTypes"
                :key="type.value"
                class="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <input
                  v-model="taskForm.type"
                  type="radio"
                  :value="type.value"
                  class="mt-1"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ type.icon }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      type.label
                    }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ type.description }}
                  </p>
                </div>
              </label>
            </div>
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
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              创建并开始
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
