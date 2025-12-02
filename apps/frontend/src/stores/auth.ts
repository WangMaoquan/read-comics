import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { STORAGE_KEYS } from '../config';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 迁移逻辑：检查旧 key 是否存在
  if (localStorage.getItem('user_data')) {
    try {
      const oldUserData = JSON.parse(
        localStorage.getItem('user_data') || 'null',
      );
      if (oldUserData) {
        localStorage.setItem(
          STORAGE_KEYS.USER_INFO,
          JSON.stringify(oldUserData),
        );
        localStorage.removeItem('user_data');
      }
    } catch {}
  }

  // 使用 useStorage 自动管理持久化
  const user = useStorage<User | null>(STORAGE_KEYS.USER_INFO, null);
  const token = useStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);

  // isAuthenticated 作为一个 computed 属性
  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (userData: User, authToken: string) => {
    user.value = userData;
    token.value = authToken;
  };

  const clearAuth = () => {
    user.value = null;
    token.value = null;
  };

  // restoreAuth 不再需要手动调用，useStorage 会自动恢复
  // 但为了保持 API 兼容性，保留空函数
  const restoreAuth = () => {
    // 自动处理
  };

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    restoreAuth,
  };
});
