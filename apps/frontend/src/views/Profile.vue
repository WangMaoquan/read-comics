<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
    <!-- 顶部背景 -->
    <div
      class="h-48 bg-linear-to-r from-blue-500 to-purple-600 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-black/10"></div>
      <div
        class="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
      ></div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- 左侧：个人概览 -->
        <div
          class="w-full md:w-1/3 animate-slide-up"
          style="animation-delay: 0.1s"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div class="p-6 text-center">
              <div class="relative inline-block">
                <div
                  class="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-blue-400 to-purple-500 p-1 shadow-lg"
                >
                  <div
                    class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-500 to-purple-600"
                  >
                    {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                </div>
                <div
                  class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"
                ></div>
              </div>

              <h2 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {{ user?.username || '用户' }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ user?.email }}
              </p>

              <div class="mt-6 flex justify-center gap-2">
                <span
                  class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
                >
                  普通用户
                </span>
                <span
                  class="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full"
                >
                  活跃
                </span>
              </div>
            </div>

            <div
              class="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50"
            >
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    阅读漫画
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    收藏
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：编辑表单 -->
        <div
          class="w-full md:w-2/3 animate-slide-up"
          style="animation-delay: 0.2s"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div
              class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                编辑资料
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                最后更新: 刚刚
              </span>
            </div>

            <div class="p-6 sm:p-8">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- 基本信息 -->
                <div class="space-y-4">
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider"
                  >
                    基本信息
                  </h4>

                  <div class="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        邮箱地址
                      </label>
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <svg
                            class="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          :value="user?.email"
                          disabled
                          class="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">
                        邮箱地址用于登录，暂不支持修改。
                      </p>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        用户名
                      </label>
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <svg
                            class="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          v-model="formData.username"
                          type="text"
                          required
                          class="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          placeholder="请输入用户名"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4"
                >
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"
                  >
                    安全设置
                    <span class="text-xs font-normal text-gray-500 normal-case"
                      >(留空则不修改)</span
                    >
                  </h4>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        新密码
                      </label>
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <svg
                            class="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <input
                          v-model="formData.password"
                          type="password"
                          class="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        确认密码
                      </label>
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <svg
                            class="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <input
                          v-model="formData.confirmPassword"
                          type="password"
                          class="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 消息提示 -->
                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-2"
                >
                  <div
                    v-if="errorMessage"
                    class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800"
                  >
                    <div class="flex">
                      <div class="shrink-0">
                        <svg
                          class="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3
                          class="text-sm font-medium text-red-800 dark:text-red-200"
                        >
                          {{ errorMessage }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </transition>

                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-2"
                >
                  <div
                    v-if="successMessage"
                    class="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-800"
                  >
                    <div class="flex">
                      <div class="shrink-0">
                        <svg
                          class="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3
                          class="text-sm font-medium text-green-800 dark:text-green-200"
                        >
                          {{ successMessage }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- 底部按钮 -->
                <div class="flex justify-end pt-4">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="relative inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <svg
                      v-if="loading"
                      class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    <span v-if="loading">保存中...</span>
                    <span v-else>保存更改</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import { usersService } from '../api/services';

  const authStore = useAuthStore();
  const user = authStore.user;

  const loading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');

  const formData = ref({
    username: '',
    password: '',
    confirmPassword: '',
  });

  onMounted(() => {
    if (user) {
      formData.value.username = user.username;
    }
  });

  const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (formData.value.password) {
      if (formData.value.password.length < 6) {
        errorMessage.value = '密码长度至少为 6 个字符';
        return;
      }
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = '两次密码输入不一致';
        return;
      }
    }

    loading.value = true;

    try {
      const updateData: any = {
        username: formData.value.username,
      };

      if (formData.value.password) {
        updateData.password = formData.value.password;
      }

      const updatedUser = await usersService.updateProfile(updateData);

      // 更新 store 中的用户信息
      // 注意：后端返回的是更新后的用户对象（不含密码）
      // 我们需要保留原有的 token
      authStore.setAuth(updatedUser, authStore.token!);

      successMessage.value = '个人信息更新成功';
      formData.value.password = '';
      formData.value.confirmPassword = '';
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '更新失败，请重试';
    } finally {
      loading.value = false;
    }
  };
</script>
