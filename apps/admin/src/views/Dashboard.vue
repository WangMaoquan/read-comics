<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { use } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { LineChart, PieChart, BarChart } from 'echarts/charts';
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  import { statsService } from '../api/services/statsService';

  use([
    CanvasRenderer,
    LineChart,
    PieChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
  ]);

  // 状态数据
  const loading = ref(true);
  const stats = ref({
    totalComics: 0,
    newComicsThisWeek: 0,
    totalUsers: 0,
    activeUsers: 0,
    storageUsed: '0 GB',
  });

  const trendData = ref<{ date: string; count: number }[]>([]);
  const storageData = ref<{ name: string; value: number }[]>([]);
  const topComicsData = ref<any[]>([]);

  // 获取数据
  const fetchData = async () => {
    loading.value = true;
    try {
      // 并行请求所有数据
      const [overview, trend, storage, topComics] = await Promise.all([
        statsService.getOverview(),
        statsService.getComicsTrend(),
        statsService.getStorageStats(),
        statsService.getTopComics(5),
      ]);

      // 更新状态
      stats.value = {
        totalComics: overview.data.totalComics,
        newComicsThisWeek: overview.data.newComicsThisWeek,
        totalUsers: overview.data.totalUsers,
        activeUsers: overview.data.activeUsers,
        storageUsed: overview.data.storageUsed,
      };

      trendData.value = trend.data;
      storageData.value = storage.data.distribution;
      topComicsData.value = topComics.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });

  // 图表配置
  const lineOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map((item) => item.date),
      axisLine: { lineStyle: { color: '#9ca3af' } },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
    },
    series: [
      {
        data: trendData.value.map((item) => item.count),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ],
          },
        },
      },
    ],
    grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
  }));

  const pieOption = computed(() => ({
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: '#9ca3af' },
    },
    series: [
      {
        name: '存储分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        data: storageData.value,
      },
    ],
  }));

  const barOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: topComicsData.value.map((item) => item.title),
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { width: 100, overflow: 'truncate' },
    },
    series: [
      {
        name: '阅读次数',
        type: 'bar',
        data: topComicsData.value.map((item) => item.readCount),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: '#10b981',
        },
      },
    ],
  }));
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      仪表盘
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总漫画数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.totalComics }}
            </p>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本周新增</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.newComicsThisWeek }}
            </p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总用户数</p>
            <div class="flex items-end gap-2">
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats.totalUsers }}
              </p>
              <span class="text-sm text-green-500 mb-1"
                >{{ stats.activeUsers }} 活跃</span
              >
            </div>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <svg
              class="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">存储使用</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.storageUsed }}
            </p>
          </div>
          <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <svg
              class="w-6 h-6 text-orange-600 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 趋势图 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          漫画上传趋势
        </h3>
        <div class="h-80">
          <v-chart class="chart" :option="lineOption" autoresize />
        </div>
      </div>

      <!-- 热门漫画 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          热门漫画 TOP 5
        </h3>
        <div class="h-80">
          <v-chart class="chart" :option="barOption" autoresize />
        </div>
      </div>
    </div>

    <!-- 存储分布 -->
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        存储分布
      </h3>
      <div class="h-80">
        <v-chart class="chart" :option="pieOption" autoresize />
      </div>
    </div>
  </div>
</template>
