<script setup lang="ts">
  import { ref, watch, nextTick } from 'vue';

  interface Props {
    visible?: boolean;
    placeholder?: string;
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void;
    (e: 'search', query: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    placeholder: '搜索漫画...',
  });

  const emit = defineEmits<Emits>();

  const searchQuery = ref('');
  const isFocused = ref(false);
  const inputRef = ref<HTMLInputElement>();

  // 监听可见性变化，自动聚焦
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
    },
  );

  // 处理搜索
  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      emit('search', searchQuery.value.trim());
    }
  };

  // 处理键盘事件
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      emit('update:visible', false);
      searchQuery.value = '';
    }
  };

  // 失去焦点时隐藏搜索栏
  const handleBlur = () => {
    // 延迟隐藏，以便点击搜索按钮
    setTimeout(() => {
      if (!isFocused.value) {
        emit('update:visible', false);
      }
    }, 200);
  };

  // 清空搜索
  const clearSearch = () => {
    searchQuery.value = '';
    inputRef.value?.focus();
  };
</script>

<template>
  <div class="relative">
    <!-- 搜索栏容器 -->
    <div
      :class="[
        'bg-gray-100 dark:bg-gray-700 rounded-lg transition-all duration-300 overflow-hidden',
        props.visible ? 'max-w-96 opacity-100' : 'max-w-0 opacity-0',
      ]"
    >
      <div class="flex items-center px-4 py-2">
        <!-- 搜索图标 -->
        <svg
          class="w-5 h-5 text-gray-400 mr-3"
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

        <!-- 搜索输入框 -->
        <input
          ref="inputRef"
          v-model="searchQuery"
          :placeholder="placeholder"
          type="text"
          @focus="isFocused = true"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        <!-- 清空按钮 -->
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="清空"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 搜索按钮 -->
        <button
          @click="handleSearch"
          class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          title="搜索"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜索触发按钮（当搜索栏隐藏时显示） -->
    <button
      v-if="!props.visible"
      @click="$emit('update:visible', true)"
      class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      title="搜索"
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  </div>
</template>
