<template>
  <button
    @click="toggleFavorite"
    :disabled="loading"
    class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
    :class="[
      isFavorited
        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
      loading ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <!-- 心形图标 -->
    <svg
      class="w-5 h-5 transition-transform duration-300"
      :class="{ 'scale-110': isFavorited }"
      :fill="isFavorited ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>

    <span class="font-medium">
      {{ isFavorited ? '已收藏' : '收藏' }}
    </span>
  </button>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { favoritesService, FavoriteStatus } from '@api/services';
  import { useAuthStore } from '@stores/auth';
  import { toast } from '../composables/useToast';

  import { handleError } from '@/utils/errorHandler';
  import { logger } from '@/utils/logger';

  const props = defineProps<{
    comicId: string;
  }>();

  const authStore = useAuthStore();
  const isFavorited = ref(false);
  const loading = ref(false);

  const checkFavoriteStatus = async () => {
    if (!authStore.isAuthenticated) return;

    try {
      const favorite = await favoritesService.checkFavorite(props.comicId);
      isFavorited.value = !!favorite;
    } catch (error) {
      logger.error('检查收藏状态失败', error);
    }
  };

  const toggleFavorite = async () => {
    if (!authStore.isAuthenticated) {
      toast.warning('请先登录');
      return;
    }

    loading.value = true;

    try {
      if (isFavorited.value) {
        // 取消收藏
        await favoritesService.removeFavorite(props.comicId);
        isFavorited.value = false;
      } else {
        // 添加收藏
        await favoritesService.addFavorite(
          props.comicId,
          FavoriteStatus.READING,
        );
        isFavorited.value = true;
      }
    } catch (error: any) {
      handleError(error, '收藏操作失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    checkFavoriteStatus();
  });
</script>
