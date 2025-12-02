<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { usersService } from '../api/services';
  import type { User, CreateUserDto } from '@read-comics/types';

  const users = ref<User[]>([]);
  const loading = ref(false);
  const showModal = ref(false);
  const editingUser = ref<User | null>(null);
  const formData = ref<CreateUserDto>({
    username: '',
    password: '',
    role: 'user',
  });

  const fetchUsers = async () => {
    loading.value = true;
    try {
      users.value = await usersService.getUsers();
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loading.value = false;
    }
  };

  const openCreateModal = () => {
    editingUser.value = null;
    formData.value = { username: '', password: '', role: 'user' };
    showModal.value = true;
  };

  const openEditModal = (user: User) => {
    editingUser.value = user;
    formData.value = {
      username: user.username,
      role: user.role,
    };
    showModal.value = true;
  };

  const handleSubmit = async () => {
    try {
      if (editingUser.value) {
        await usersService.updateUser(editingUser.value.id, formData.value);
      } else {
        await usersService.createUser(formData.value);
      }
      showModal.value = false;
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此用户吗？')) return;
    try {
      await usersService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败');
    }
  };

  onMounted(fetchUsers);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        新增用户
      </button>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div v-if="loading" class="p-8 text-center text-gray-500">加载中...</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-medium">用户名</th>
              <th class="p-4 font-medium">角色</th>
              <th class="p-4 font-medium">创建时间</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4 font-medium text-gray-900 dark:text-white">
                {{ user.username }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  "
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4 text-gray-500 dark:text-gray-400 text-sm">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="p-4">
                <div class="flex space-x-3">
                  <button
                    @click="openEditModal(user)"
                    class="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium"
                  >
                    编辑
                  </button>
                  <button
                    @click="handleDelete(user.id)"
                    class="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ editingUser ? '编辑用户' : '新增用户' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >用户名</label
            >
            <input
              v-model="formData.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              密码
              <span v-if="editingUser" class="text-xs text-gray-500 font-normal"
                >(留空不修改)</span
              >
            </label>
            <input
              v-model="formData.password"
              type="password"
              :required="!editingUser"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >角色</label
            >
            <select
              v-model="formData.role"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
