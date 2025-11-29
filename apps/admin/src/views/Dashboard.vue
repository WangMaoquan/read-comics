<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { comicsService } from '../api/services';

  const totalComics = ref(0);
  const newComicsThisWeek = ref(0); // Mock data for now
  const storageUsage = ref('45.2 GB'); // Mock data for now

  onMounted(async () => {
    try {
      const comics = await comicsService.getComics();
      totalComics.value = comics.length;
      // logic for new comics this week can be added here if we have date fields
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  });
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      仪表盘
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-gray-500 text-sm font-medium">总漫画数</h3>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {{ totalComics }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-gray-500 text-sm font-medium">本周新增</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          {{ newComicsThisWeek }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-gray-500 text-sm font-medium">存储占用</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ storageUsage }}</p>
      </div>
    </div>
  </div>
</template>
