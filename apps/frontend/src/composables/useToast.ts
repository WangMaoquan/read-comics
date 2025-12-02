import { ref, onMounted, onUnmounted } from 'vue';
import { toast as toastService, type ToastMessage } from '../utils/toast';

// Re-export ToastMessage type
export type { ToastMessage } from '../utils/toast';

export function useToast() {
  const messages = ref<ToastMessage[]>([]);
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = toastService.subscribe((message) => {
      messages.value.push(message);

      if (message.duration && message.duration > 0) {
        setTimeout(() => {
          remove(message.id);
        }, message.duration);
      }
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const remove = (id: number) => {
    const index = messages.value.findIndex((m) => m.id === id);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  };

  return {
    messages,
    remove,
  };
}

// 导出 toast 服务供组件使用
export { toastService as toast };
