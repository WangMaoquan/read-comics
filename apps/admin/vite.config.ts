import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { compression } from 'vite-plugin-compression2';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // Bundle analysis visualization
    visualizer({
      filename: './analysis-bundle/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Compression (gzip by default)
    compression(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/admin'),
    emptyOutDir: true,

    // 优化代码分割
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks(id) {
          // Vue 核心库
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia')
          ) {
            return 'vue';
          }

          // ECharts 核心
          if (id.includes('echarts/core')) {
            return 'echarts-core';
          }

          // ECharts 图表组件
          if (id.includes('echarts/charts')) {
            return 'echarts-charts';
          }

          // ECharts 其他组件
          if (id.includes('echarts') || id.includes('zrender')) {
            return 'echarts';
          }

          if (id.includes('vue-echarts')) {
            return 'vue-echarts';
          }

          if (id.includes('node_modules/@vueuse')) {
            return 'vueuse';
          }

          if (id.includes('@read-comics/api-client')) {
            return 'api-client';
          }

          // 默认分包
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 自定义文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 根据文件类型分类存放
          const info = assetInfo.name || '';
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(info)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(info)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // 使用 terser 进行更好的压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.debug'], // 移除指定函数
      },
    },

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 配置构建目标
    target: 'es2015',

    // 启用源码映射
    sourcemap: false, // 生产环境关闭源码映射以减小体积

    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 600,
  },

  // 优化预构建配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'echarts', '@vueuse/core'],
  },
});
