export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

class ToastService {
  private callbacks: Array<(message: ToastMessage) => void> = [];

  subscribe(callback: (message: ToastMessage) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private notify(message: ToastMessage) {
    this.callbacks.forEach((callback) => callback(message));
  }

  show(message: string, type: ToastMessage['type'] = 'info', duration = 3000) {
    this.notify({ id: Date.now(), message, type, duration });
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 3500) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastService();
