<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 p-4"
  >
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"
      ></div>
    </div>

    <!-- 登录/注册卡片 -->
    <div class="relative w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">漫画阅读器</h1>
        <p class="text-gray-400">
          {{
            mode === 'login'
              ? '欢迎回来'
              : mode === 'register'
                ? '创建新账户'
                : '重置密码'
          }}
        </p>
      </div>

      <!-- 主卡片 -->
      <div
        class="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8"
      >
        <!-- 切换按钮 (仅在登录/注册模式显示) -->
        <div
          v-if="mode !== 'forgot-password'"
          class="flex mb-8 bg-gray-900/50 rounded-xl p-1"
        >
          <button
            @click="switchMode('login')"
            :class="[
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              mode === 'login'
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white',
            ]"
          >
            登录
          </button>
          <button
            @click="switchMode('register')"
            :class="[
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              mode === 'register'
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white',
            ]"
          >
            注册
          </button>
        </div>

        <!-- 错误提示 -->
        <Alert
          v-if="errorMessage"
          :message="errorMessage"
          type="error"
          class="mb-6"
        />

        <!-- 成功提示 -->
        <Alert
          v-if="successMessage"
          :message="successMessage"
          type="success"
          class="mb-6"
        />

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- 用户名 (仅注册时) -->
          <div v-if="mode === 'register'" class="group">
            <label class="block text-sm font-medium text-gray-300 mb-2"
              >用户名</label
            >
            <div class="relative">
              <input
                v-model="formData.username"
                type="text"
                required
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <!-- 邮箱 -->
          <div class="group">
            <label class="block text-sm font-medium text-gray-300 mb-2"
              >邮箱</label
            >
            <div class="relative">
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <!-- 验证码 (仅忘记密码时) -->
          <div v-if="mode === 'forgot-password'" class="group">
            <label class="block text-sm font-medium text-gray-300 mb-2"
              >验证码</label
            >
            <div class="flex space-x-2">
              <input
                v-model="formData.verificationCode"
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

          <!-- 密码 -->
          <div class="group">
            <label class="block text-sm font-medium text-gray-300 mb-2">{{
              mode === 'forgot-password' ? '新密码' : '密码'
            }}</label>
            <div class="relative">
              <input
                v-model="formData.password"
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

          <!-- 确认密码 (注册或重置密码时) -->
          <div
            v-if="mode === 'register' || mode === 'forgot-password'"
            class="group"
          >
            <label class="block text-sm font-medium text-gray-300 mb-2"
              >确认密码</label
            >
            <div class="relative">
              <input
                v-model="formData.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- 记住我 / 忘记密码 -->
          <div
            v-if="mode === 'login'"
            class="flex items-center justify-between"
          >
            <label class="flex items-center cursor-pointer">
              <input
                v-model="formData.rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-600 bg-gray-900/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer"
              />
              <span class="ml-2 text-sm text-gray-400">记住我</span>
            </label>
            <button
              type="button"
              @click="switchMode('forgot-password')"
              class="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              忘记密码？
            </button>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!loading">{{
              mode === 'login'
                ? '登录'
                : mode === 'register'
                  ? '注册'
                  : '重置密码'
            }}</span>
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

        <!-- 社交登录 (仅登录/注册模式) -->
        <div v-if="mode !== 'forgot-password'" class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-800/50 text-gray-400">或者使用</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              GitHub
            </button>
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>

      <!-- 底部链接 -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-400">
          {{
            mode === 'login'
              ? '还没有账户？'
              : mode === 'register'
                ? '已有账户？'
                : '想起密码了？'
          }}
          <button
            @click="switchMode(mode === 'login' ? 'register' : 'login')"
            class="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {{
              mode === 'login'
                ? '立即注册'
                : mode === 'register'
                  ? '立即登录'
                  : '返回登录'
            }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '@stores/auth';
  import { authService } from '@api/services';
  import Alert from '../components/Alert.vue';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const mode = ref<'login' | 'register' | 'forgot-password'>('login');
  const showPassword = ref(false);
  const loading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');
  const countdown = ref(0);

  const formData = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    rememberMe: false,
  });

  const switchMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    mode.value = newMode;
    errorMessage.value = '';
    successMessage.value = '';
    formData.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      rememberMe: false,
    };
  };

  const sendCode = async () => {
    if (!formData.value.email) {
      errorMessage.value = '请输入邮箱';
      return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
      await authService.forgotPassword(formData.value.email);
      successMessage.value =
        '验证码已发送，请检查您的邮箱（模拟环境请查看后端控制台）';
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '发送验证码失败';
    } finally {
      loading.value = false;
    }
  };

  const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    // 验证
    if (mode.value === 'register' || mode.value === 'forgot-password') {
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = '两次密码输入不一致';
        return;
      }
      if (formData.value.password.length < 6) {
        errorMessage.value = '密码长度至少为 6 个字符';
        return;
      }
    }

    loading.value = true;

    try {
      if (mode.value === 'login') {
        // 登录
        const response = await authService.login({
          email: formData.value.email,
          password: formData.value.password,
        });
        authStore.setAuth(response.user, response.token);
        const redirect = route.query.redirect as string;
        router.push(redirect || '/');
      } else if (mode.value === 'register') {
        // 注册
        const response = await authService.register({
          username: formData.value.username,
          email: formData.value.email,
          password: formData.value.password,
        });
        authStore.setAuth(response.user, response.token);
        const redirect = route.query.redirect as string;
        router.push(redirect || '/');
      } else if (mode.value === 'forgot-password') {
        // 重置密码
        await authService.resetPassword({
          email: formData.value.email,
          code: formData.value.verificationCode,
          password: formData.value.password,
        });
        successMessage.value = '密码重置成功，请登录';
        setTimeout(() => {
          switchMode('login');
        }, 2000);
      }
    } catch (error: any) {
      errorMessage.value =
        error.response?.data?.message ||
        error.message ||
        '操作失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
