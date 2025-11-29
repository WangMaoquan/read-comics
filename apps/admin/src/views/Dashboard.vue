<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { use } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { LineChart, BarChart, PieChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  import { comicsService } from '../api/services';

  // 注册必要的 ECharts 组件
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  ]);

  // 真实数据
  const totalComics = ref(0);

  // Mock 数据
  const mockData = {
    newComicsThisWeek: 12,
    storageUsage: '45.2 GB',
    totalUsers: 156,
    activeUsers: 43,
    totalReads: 2847,
  };

  // 漫画上传趋势（过去7天）
  const comicsTrendData = {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    counts: [5, 8, 12, 7, 15, 10, 12],
  };

  // 热门漫画 TOP 5
  const topComics = [
    { name: 'One Piece', reads: 456 },
    { name: 'Naruto', reads: 389 },
    { name: 'Attack on Titan', reads: 345 },
    { name: 'Demon Slayer', reads: 298 },
    { name: 'My Hero Academia', reads: 267 },
  ];

  // 存储分布
  const storageDistribution = [
    { name: 'Comics', value: 35.6 },
    { name: 'Cache', value: 8.3 },
    { name: 'Thumbnails', value: 1.3 },
  ];

  // 趋势图配置
  const trendChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'category',
      data: comicsTrendData.dates,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#333' } },
    },
    series: [
      {
        data: comicsTrendData.counts,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 2 },
      },
    ],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  }));

  // 热门漫画柱状图配置
  const topComicsChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#333' } },
    },
    yAxis: {
      type: 'category',
      data: topComics.map((c) => c.name),
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999' },
    },
    series: [
      {
        data: topComics.map((c) => c.reads),
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#3b82f6' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 20,
      },
    ],
    grid: { left: 150, right: 20, top: 20, bottom: 20 },
  }));

  // 存储分布饼图配置
  const storageChartOption = computed(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} GB ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#999' },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1f2937',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
        data: storageDistribution.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: ['#3b82f6', '#8b5cf6', '#ec4899'][index],
          },
        })),
      },
    ],
  }));

  // 获取真实漫画数据
  const fetchData = async () => {
    try {
      const comics = await comicsService.getComics();
      totalComics.value = comics.length;
    } catch (error) {
      console.error('Failed to fetch comics:', error);
    }
  };

  onMounted(fetchData);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      仪表盘
    </h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- 总漫画数 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总漫画数</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ totalComics }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg
              class="w-8 h-8 text-blue-600"
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

      <!-- 本周新增 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本周新增</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">
              {{ mockData.newComicsThisWeek }}
            </p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 总用户数 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总用户数</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ mockData.totalUsers }}
            </p>
            <p class="text-xs text-green-500 mt-1">
              活跃: {{ mockData.activeUsers }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg
              class="w-8 h-8 text-purple-600"
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

      <!-- 存储占用 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">存储占用</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ mockData.storageUsage }}
            </p>
          </div>
          <div class="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <svg
              class="w-8 h-8 text-pink-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 漫画上传趋势 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          漫画上传趋势
        </h3>
        <v-chart :option="trendChartOption" style="height: 300px" />
      </div>

      <!-- 存储分布 -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          存储分布
        </h3>
        <v-chart :option="storageChartOption" style="height: 300px" />
      </div>
    </div>

    <!-- 热门漫画排行 -->
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        热门漫画 TOP 5
      </h3>
      <v-chart :option="topComicsChartOption" style="height: 300px" />
    </div>
  </div>
</template>
