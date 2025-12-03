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

        <LoginForm v-if="mode === 'login'" @switch-mode="switchMode" />
        <RegisterForm v-if="mode === 'register'" />
        <ForgotPasswordForm
          v-if="mode === 'forgot-password'"
          @switch-mode="switchMode"
        />

        <SocialLogin v-if="mode !== 'forgot-password'" />

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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import LoginForm from '@components/auth/LoginForm.vue';
  import RegisterForm from '@components/auth/RegisterForm.vue';
  import ForgotPasswordForm from '@components/auth/ForgotPasswordForm.vue';
  import SocialLogin from '@components/auth/SocialLogin.vue';

  const mode = ref<'login' | 'register' | 'forgot-password'>('login');

  const switchMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    mode.value = newMode;
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
