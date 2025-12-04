import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useColorMode, useStorage } from '@vueuse/core';
import { STORAGE_KEYS } from '../config';

export const useUIStore = defineStore('ui', () => {
  // 主题管理 - 使用 useColorMode 自动处理 class 和 storage
  const mode = useColorMode({
    storageKey: STORAGE_KEYS.THEME,
    attribute: 'class',
    selector: 'html',
    initialValue: 'auto',
  });

  // 为了保持 API 兼容性，提供 theme 属性
  // theme 返回用户设置的偏好（可能是 auto），而不是实际应用的模式
  const theme = computed({
    get: () => {
      // 从 localStorage 读取用户设置的偏好
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      return (stored as 'light' | 'dark' | 'auto') || 'auto';
    },
    set: (val) => {
      mode.value = val;
      localStorage.setItem(STORAGE_KEYS.THEME, val);
    },
  });

  // 字体大小
  const fontSize = useStorage<'small' | 'medium' | 'large'>(
    'ui_font_size',
    'medium',
  );

  // 侧边栏状态
  const sidebarOpen = ref(false);

  // 加载状态
  const loading = ref(false);

  // 错误状态
  const error = ref<string | null>(null);

  // Getters
  const isDarkMode = computed(() => {
    if (mode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode.value === 'dark';
  });

  const getFontSizeValue = computed(() => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    return sizes[fontSize.value];
  });

  // Actions
  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    mode.value = newTheme;
  };

  // initTheme 不再需要，useColorMode 会自动初始化
  const initTheme = () => {
    // 空实现以保持兼容性
  };

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    fontSize.value = size;
    applyFontSize();
  };

  const applyFontSize = () => {
    const root = document.documentElement;
    root.style.fontSize = getFontSizeValue.value;
  };

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const openSidebar = () => {
    sidebarOpen.value = true;
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const clear = () => {
    mode.value = 'auto';
    fontSize.value = 'medium';
    sidebarOpen.value = false;
    loading.value = false;
    error.value = null;
    applyFontSize();
  };

  // 初始化字体
  applyFontSize();

  return {
    theme,
    mode,
    fontSize,
    sidebarOpen,
    loading,
    error,
    isDarkMode,
    getFontSize: getFontSizeValue,
    setTheme,
    initTheme,
    setFontSize,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setLoading,
    setError,
    clear,
  };
});
