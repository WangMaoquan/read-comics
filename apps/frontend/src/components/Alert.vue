<script setup lang="ts">
  defineProps<{
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
  }>();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'success':
        return 'M5 13l4 4L19 7';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };
</script>

<template>
  <div :class="['p-4 border rounded-xl', getColorClasses(type || 'info')]">
    <div class="flex items-center">
      <svg
        class="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="getIcon(type || 'info')"
        />
      </svg>
      <p class="text-sm">{{ message }}</p>
    </div>
  </div>
</template>
