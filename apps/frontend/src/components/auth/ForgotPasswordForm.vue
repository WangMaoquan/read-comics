<script setup lang="ts">
  import { ref } from 'vue';
  import { authService } from '@/api/services';
  import { toast } from '@/composables/useToast';
  import Alert from '@/components/Alert.vue';

  const email = ref('');
  const verificationCode = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const showPassword = ref(false);
  const loading = ref(false);
  const successMessage = ref('');
  const countdown = ref(0);

  const emit = defineEmits<{
    (e: 'switch-mode', mode: 'login'): void;
  }>();

  const sendCode = async () => {
    if (!email.value) {
      toast.error('请输入邮箱');
      return;
    }

    loading.value = true;

    try {
      await authService.forgotPassword(email.value);
      successMessage.value = '验证码已发送，请检查您的邮箱';
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } catch (e) {
      // 已经在api/config 中处理了 不管就好
      // console.log(e);
    } finally {
      loading.value = false;
    }
  };

  const handleSubmit = async () => {
    successMessage.value = '';

    // 客户端验证
    if (password.value !== confirmPassword.value) {
      toast.error('两次密码输入不一致');
      return;
    }
    if (password.value.length < 6) {
      toast.error('密码长度至少为 6 个字符');
      return;
    }

    loading.value = true;

    try {
      await authService.resetPassword({
        email: email.value,
        code: verificationCode.value,
        password: password.value,
      });
      successMessage.value = '密码重置成功，请登录';
      setTimeout(() => {
        emit('switch-mode', 'login');
      }, 2000);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <Alert
      v-if="successMessage"
      :message="successMessage"
      type="success"
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
      <label class="block text-sm font-medium text-gray-300 mb-2">验证码</label>
      <div class="flex space-x-2">
        <input
          v-model="verificationCode"
          type="text"
          required
          class="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="请输入验证码"
        />
        <button
          type="button"
          @click="sendCode"
          :disabled="countdown > 0 || loading"
          class="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
        </button>
      </div>
    </div>

    <div class="group">
      <label class="block text-sm font-medium text-gray-300 mb-2">新密码</label>
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

    <div class="group">
      <label class="block text-sm font-medium text-gray-300 mb-2"
        >确认密码</label
      >
      <div class="relative">
        <input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          required
          class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          placeholder="••••••••"
        />
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <span v-if="!loading">重置密码</span>
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
