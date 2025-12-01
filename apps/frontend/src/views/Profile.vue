<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          个人资料
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>更新您的个人信息和密码。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-5 space-y-6">
          <!-- 邮箱 (只读) -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱
            </label>
            <div class="mt-1">
              <input
                type="email"
                :value="user?.email"
                disabled
                class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p class="mt-2 text-sm text-gray-500">邮箱不可修改</p>
            </div>
          </div>

          <!-- 用户名 -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              用户名
            </label>
            <div class="mt-1">
              <input
                v-model="formData.username"
                type="text"
                required
                class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <!-- 修改密码 -->
          <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4
              class="text-base font-medium text-gray-900 dark:text-white mb-4"
            >
              修改密码
            </h4>
            <p class="text-sm text-gray-500 mb-4">留空则不修改密码</p>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  新密码
                </label>
                <div class="mt-1">
                  <input
                    v-model="formData.password"
                    type="password"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  确认新密码
                </label>
                <div class="mt-1">
                  <input
                    v-model="formData.confirmPassword"
                    type="password"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 错误/成功提示 -->
          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ errorMessage }}
                </h3>
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  {{ successMessage }}
                </h3>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="loading"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span v-if="loading">保存中...</span>
              <span v-else>保存更改</span>
            </button>
          </div>
        </form>
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
