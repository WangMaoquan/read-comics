import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
          console.log(id);
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia')
          ) {
            return 'vue';
          }
          if (id.includes('echarts') || id.includes('vue-echarts')) {
            return 'echarts';
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

    // 启用压缩
    minify: 'esbuild',
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
  },

  // 优化预构建配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'echarts', '@vueuse/core'],
  },
});
