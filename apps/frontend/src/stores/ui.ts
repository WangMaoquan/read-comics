import { defineStore } from 'pinia';

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    theme: 'light',
    fontSize: 'medium',
    sidebarOpen: false,
    loading: false,
    error: null,
    notifications: [],
  }),

  getters: {
    isDarkMode: (state) => {
      if (state.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.theme === 'dark';
    },

    getFontSize: (state) => {
      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
      };
      return sizes[state.fontSize];
    },

    hasNotifications: (state) => state.notifications.length > 0,

    getNotifications: (state) => state.notifications,

    getActiveNotifications: (state) =>
      state.notifications.filter((n) => !n.duration || n.duration > 0),
  },

  actions: {
    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme;
      this.applyTheme();
    },

    setFontSize(fontSize: 'small' | 'medium' | 'large') {
      this.fontSize = fontSize;
      this.applyFontSize();
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    openSidebar() {
      this.sidebarOpen = true;
    },

    closeSidebar() {
      this.sidebarOpen = false;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    addNotification(notification: Omit<UIState['notifications'][0], 'id'>) {
      const id = Date.now().toString();
      this.notifications.push({
        id,
        ...notification,
      });

      // Auto remove notification if duration is specified
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          this.removeNotification(id as string);
        }, notification.duration);
      }

      return id;
    },

    removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },

    clearNotifications() {
      this.notifications = [];
    },

    showSuccess(title: string, message: string, duration: number = 3000) {
      return this.addNotification({
        type: 'success',
        title,
        message,
        duration,
      });
    },

    showError(title: string, message: string, duration: number = 5000) {
      return this.addNotification({
        type: 'error',
        title,
        message,
        duration,
      });
    },

    showWarning(title: string, message: string, duration: number = 4000) {
      return this.addNotification({
        type: 'warning',
        title,
        message,
        duration,
      });
    },

    showInfo(title: string, message: string, duration: number = 3000) {
      return this.addNotification({
        type: 'info',
        title,
        message,
        duration,
      });
    },

    applyTheme() {
      const root = document.documentElement;
      if (this.isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    },

    applyFontSize() {
      const root = document.documentElement;
      root.style.fontSize = this.getFontSize;
    },

    clear() {
      this.theme = 'light';
      this.fontSize = 'medium';
      this.sidebarOpen = false;
      this.loading = false;
      this.error = null;
      this.notifications = [];
      this.applyTheme();
      this.applyFontSize();
    },
  },
});
