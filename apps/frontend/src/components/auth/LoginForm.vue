<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { authService } from '@/api/services';
  import Alert from '@/components/Alert.vue';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const email = ref('');
  const password = ref('');
  const rememberMe = ref(false);
  const showPassword = ref(false);
  const loading = ref(false);
  const errorMessage = ref('');

  const emit = defineEmits<{
    (e: 'switch-mode', mode: 'register' | 'forgot-password'): void;
  }>();

  const handleSubmit = async () => {
    errorMessage.value = '';
    loading.value = true;

    try {
      const response = await authService.login({
        email: email.value,
        password: password.value,
      });
      // 使用 access_token，并为 user 添加 username（如果后端没有返回）
      const user = {
        ...response.user,
        username: response.user.email.split('@')[0], // 使用邮箱前缀作为默认用户名
      };
      authStore.setAuth(user, response.access_token);
      const redirect = route.query.redirect as string;
      router.push(redirect || '/');
    } catch (error: any) {
      errorMessage.value = error.message || '登录失败';
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <Alert
      v-if="errorMessage"
      :message="errorMessage"
      type="error"
      class="mb-6"
    />

    <div class="group">
      <label class="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
      <div class="relative">
        <input
          v-model="email"
          type="email"
          required
          class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="your@email.com"
        />
      </div>
    </div>

    <div class="group">
      <label class="block text-sm font-medium text-gray-300 mb-2">密码</label>
      <div class="relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="••••••••"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            v-if="!showPassword"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center cursor-pointer">
        <input
          v-model="rememberMe"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer"
        />
        <span class="ml-2 text-sm text-gray-400">记住我</span>
      </label>
      <button
        type="button"
        @click="emit('switch-mode', 'forgot-password')"
        class="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        忘记密码？
      </button>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <span v-if="!loading">登录</span>
      <span v-else class="flex items-center justify-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
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
        处理中...
      </span>
    </button>
  </form>
</template>
