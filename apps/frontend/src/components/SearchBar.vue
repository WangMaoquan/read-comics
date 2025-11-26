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
        'glass rounded-full transition-all duration-300 overflow-hidden shadow-sm',
        props.visible
          ? 'w-full md:w-96 opacity-100 scale-100'
          : 'w-0 opacity-0 scale-95',
        isFocused ? 'ring-2 ring-blue-500/50 shadow-glow' : '',
      ]"
    >
      <div class="flex items-center px-4 py-2">
        <!-- 搜索图标 -->
        <svg
          class="w-5 h-5 text-gray-400 mr-3 shrink-0"
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
          class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base w-full"
        />

        <!-- 清空按钮 -->
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mr-2"
          title="清空"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 搜索按钮 -->
        <button
          @click="handleSearch"
          class="p-2 rounded-full gradient-primary text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 shrink-0"
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
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
      title="搜索"
    >
      <svg
        class="w-6 h-6"
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
