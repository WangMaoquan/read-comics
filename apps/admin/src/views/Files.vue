<script setup lang="ts">
  import { ref, computed } from 'vue';

  // 文件类型
  interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'directory';
    size: number;
    mimeType?: string;
    createdAt: Date;
    path: string;
  }

  // Mock 数据
  const files = ref<FileItem[]>([
    {
      id: '1',
      name: 'One Piece - Vol.1.cbz',
      type: 'file',
      size: 45678901,
      mimeType: 'application/x-cbz',
      createdAt: new Date('2024-01-15'),
      path: '/comics/',
    },
    {
      id: '2',
      name: 'Attack on Titan',
      type: 'directory',
      size: 0,
      createdAt: new Date('2024-01-10'),
      path: '/comics/',
    },
    {
      id: '3',
      name: 'Naruto - Complete.zip',
      type: 'file',
      size: 123456789,
      mimeType: 'application/zip',
      createdAt: new Date('2024-01-12'),
      path: '/comics/',
    },
    {
      id: '4',
      name: 'Demon Slayer - Vol.5.cbz',
      type: 'file',
      size: 34567890,
      mimeType: 'application/x-cbz',
      createdAt: new Date('2024-01-18'),
      path: '/comics/',
    },
  ]);

  // 状态
  const loading = ref(false);
  const currentPath = ref('/comics');
  const searchQuery = ref('');
  const selectedFiles = ref<string[]>([]);
  const viewMode = ref<'list' | 'grid'>('list');
  const showUploadModal = ref(false);
  const scanProgress = ref(0);
  const isScanning = ref(false);

  // 计算属性
  const filteredFiles = computed(() => {
    if (!searchQuery.value) return files.value;
    const query = searchQuery.value.toLowerCase();
    return files.value.filter((file) =>
      file.name.toLowerCase().includes(query),
    );
  });

  const selectedCount = computed(() => selectedFiles.value.length);

  const totalSize = computed(() => {
    return files.value.reduce((sum, file) => sum + file.size, 0);
  });

  // 辅助函数
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const getFileIcon = (file: FileItem): string => {
    if (file.type === 'directory') return '📁';
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('cbz'))
      return '📦';
    return '📄';
  };

  // 文件操作
  const toggleFileSelection = (fileId: string) => {
    const index = selectedFiles.value.indexOf(fileId);
    if (index > -1) {
      selectedFiles.value.splice(index, 1);
    } else {
      selectedFiles.value.push(fileId);
    }
  };

  const selectAll = () => {
    if (selectedFiles.value.length === files.value.length) {
      selectedFiles.value = [];
    } else {
      selectedFiles.value = files.value.map((f) => f.id);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`确定要删除 ${selectedCount.value} 个文件吗？`)) return;

    loading.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      files.value = files.value.filter(
        (f) => !selectedFiles.value.includes(f.id),
      );
      selectedFiles.value = [];
      alert('删除成功');
    } catch (error) {
      alert('删除失败');
    } finally {
      loading.value = false;
    }
  };

  // 文件上传
  const uploadFiles = ref<File[]>([]);

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      uploadFiles.value = Array.from(target.files);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      uploadFiles.value = Array.from(event.dataTransfer.files);
      showUploadModal.value = true;
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const startUpload = async () => {
    if (uploadFiles.value.length === 0) return;

    loading.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 添加到文件列表（模拟）
      uploadFiles.value.forEach((file, index) => {
        files.value.unshift({
          id: `new-${Date.now()}-${index}`,
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          createdAt: new Date(),
          path: currentPath.value,
        });
      });

      uploadFiles.value = [];
      showUploadModal.value = false;
      alert('上传成功');
    } catch (error) {
      alert('上传失败');
    } finally {
      loading.value = false;
    }
  };

  // 文件扫描
  const startScan = async () => {
    if (!confirm('确定要扫描整个目录吗？这可能需要一些时间。')) return;

    isScanning.value = true;
    scanProgress.value = 0;

    // 模拟扫描进度
    const interval = setInterval(() => {
      scanProgress.value += 10;
      if (scanProgress.value >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          isScanning.value = false;
          scanProgress.value = 0;
          alert('扫描完成！发现 3 个新文件');
        }, 500);
      }
    }, 300);
  };

  // 刷新列表
  const refreshFiles = async () => {
    loading.value = true;
    try {
      // TODO: API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div>
    <!-- 标题栏 -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          文件管理
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ currentPath }} • {{ files.length }} 个文件 •
          {{ formatFileSize(totalSize) }}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          @click="showUploadModal = true"
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          上传文件
        </button>

        <button
          @click="startScan"
          :disabled="isScanning"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': isScanning }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {{ isScanning ? '扫描中...' : '扫描文件' }}
        </button>
      </div>
    </div>

    <!-- 扫描进度 -->
    <div
      v-if="isScanning"
      class="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-blue-900 dark:text-blue-300"
          >正在扫描文件...</span
        >
        <span class="text-sm font-medium text-blue-900 dark:text-blue-300"
          >{{ scanProgress }}%</span
        >
      </div>
      <div class="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: scanProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <!-- 搜索 -->
        <div class="flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文件..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-3">
          <!-- 选中文件操作 -->
          <div v-if="selectedCount > 0" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >已选 {{ selectedCount }}</span
            >
            <button
              @click="deleteSelected"
              class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              删除
            </button>
            <button
              @click="selectedFiles = []"
              class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              取消
            </button>
          </div>

          <!-- 视图切换 -->
          <div
            class="flex border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1.5 rounded-l-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              列表
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1.5 rounded-r-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              网格
            </button>
          </div>

          <!-- 刷新 -->
          <button
            @click="refreshFiles"
            class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
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
          </button>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr class="text-left text-sm text-gray-600 dark:text-gray-400">
              <th class="p-4 w-12">
                <input
                  type="checkbox"
                  :checked="
                    selectedFiles.length === files.length && files.length > 0
                  "
                  @change="selectAll"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th class="p-4">名称</th>
              <th class="p-4">大小</th>
              <th class="p-4">类型</th>
              <th class="p-4">创建时间</th>
              <th class="p-4">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="file in filteredFiles"
              :key="file.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :checked="selectedFiles.includes(file.id)"
                  @change="toggleFileSelection(file.id)"
                  class="rounded border-gray-300 dark:border-gray-600"
                />
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ getFileIcon(file) }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    file.name
                  }}</span>
                </div>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-400">
                {{ formatFileSize(file.size) }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {{
                    file.type === 'directory'
                      ? '文件夹'
                      : file.mimeType?.split('/')[1] || '文件'
                  }}
                </span>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-400 text-sm">
                {{ formatDate(file.createdAt) }}
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button class="text-blue-600 hover:text-blue-800 text-sm">
                    下载
                  </button>
                  <button class="text-red-600 hover:text-red-800 text-sm">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 网格视图 -->
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4"
      >
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedFiles.includes(file.id)"
            @change="toggleFileSelection(file.id)"
            class="absolute top-2 left-2 rounded border-gray-300 dark:border-gray-600"
          />
          <div class="flex flex-col items-center text-center">
            <span class="text-5xl mb-2">{{ getFileIcon(file) }}</span>
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate w-full"
            >
              {{ file.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ formatFileSize(file.size) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredFiles.length === 0" class="p-12 text-center">
        <svg
          class="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">暂无文件</p>
        <button
          @click="showUploadModal = true"
          class="mt-4 text-blue-600 hover:text-blue-800"
        >
          上传第一个文件
        </button>
      </div>
    </div>

    <!-- 上传模态框 -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          上传文件
        </h2>

        <div class="mb-4">
          <label
            class="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              type="file"
              multiple
              accept=".zip,.cbz"
              @change="handleFileSelect"
              class="hidden"
            />
            <svg
              class="w-12 h-12 mx-auto text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="text-gray-600 dark:text-gray-400">
              点击选择文件或拖拽到此处
            </p>
            <p class="text-xs text-gray-500 mt-1">支持 ZIP, CBZ 格式</p>
          </label>
        </div>

        <!-- 已选文件列表 -->
        <div
          v-if="uploadFiles.length > 0"
          class="mb-4 max-h-40 overflow-y-auto"
        >
          <div
            v-for="(file, index) in uploadFiles"
            :key="index"
            class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
          >
            <span class="text-sm text-gray-900 dark:text-white truncate">{{
              file.name
            }}</span>
            <span class="text-xs text-gray-500 ml-2">{{
              formatFileSize(file.size)
            }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="
              showUploadModal = false;
              uploadFiles = [];
            "
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="startUpload"
            :disabled="uploadFiles.length === 0 || loading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '上传中...' : `上传 (${uploadFiles.length})` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
