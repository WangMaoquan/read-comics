<script setup lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    text?: string;
    centered?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    color: 'primary',
    centered: false,
  });

  // 根据大小获取对应的尺寸类
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // 根据颜色获取对应的颜色类
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center',
      props.centered ? 'min-h-screen' : '',
    ]"
  >
    <!-- 旋转的加载动画 -->
    <div
      :class="[
        'animate-spin',
        sizeClasses[props.size],
        colorClasses[props.color],
      ]"
    >
      <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- 加载文本 -->
    <p
      v-if="props.text"
      :class="['mt-3 text-sm font-medium', colorClasses[props.color]]"
    >
      {{ props.text }}
    </p>
  </div>
</template>

<style scoped>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
