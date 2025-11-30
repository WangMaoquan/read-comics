import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isAuthenticated = ref(!!token.value);

  const setAuth = (userData: User, authToken: string) => {
    user.value = userData;
    token.value = authToken;
    isAuthenticated.value = true;
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const clearAuth = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const restoreAuth = () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');

    if (savedToken && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        token.value = savedToken;
        isAuthenticated.value = true;
      } catch (error) {
        console.error('Failed to restore auth:', error);
        clearAuth();
      }
    }
  };

  // 初始化时恢复认证状态
  restoreAuth();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    restoreAuth,
  };
});
