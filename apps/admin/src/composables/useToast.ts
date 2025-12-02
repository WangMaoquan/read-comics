import { createApp } from 'vue';
import Toast from '../components/Toast.vue';

// 单例模式管理 Toast 实例
let toastInstance: any = null;

const initToast = () => {
  if (toastInstance) return;

  const div = document.createElement('div');
  document.body.appendChild(div);

  const app = createApp(Toast);
  toastInstance = app.mount(div);
};

export const useToast = () => {
  if (!toastInstance) {
    initToast();
  }

  return {
    success: (msg: string) => toastInstance.add(msg, 'success'),
    error: (msg: string) => toastInstance.add(msg, 'error'),
    warning: (msg: string) => toastInstance.add(msg, 'warning'),
    info: (msg: string) => toastInstance.add(msg, 'info'),
  };
};
