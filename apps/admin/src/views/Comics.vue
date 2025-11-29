<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      漫画管理
    </h1>
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div
        class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <input
          type="text"
          placeholder="搜索漫画..."
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          扫描新漫画
        </button>
      </div>
      <div class="p-8 text-center text-gray-500">
        表格占位符 - 后续实现数据列表
      </div>
    </div>
  </div>
</template>
