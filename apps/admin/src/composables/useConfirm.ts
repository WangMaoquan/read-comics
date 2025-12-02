import { createApp } from 'vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

let confirmInstance: any = null;

const initConfirm = () => {
  if (confirmInstance) return;

  const div = document.createElement('div');
  document.body.appendChild(div);

  const app = createApp(ConfirmDialog);
  confirmInstance = app.mount(div);
};

export const useConfirm = () => {
  if (!confirmInstance) {
    initConfirm();
  }

  return (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
  }) => {
    return confirmInstance.open(options);
  };
};
