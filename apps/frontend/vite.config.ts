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
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@read-comics/types': path.resolve(__dirname, '../../packages/types/src'),
      '@utils-shared': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/frontend'),
    emptyOutDir: true,
    // 关闭 source map 以减小构建产物体积
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制为 1000kb
    chunkSizeWarningLimit: 1000,
    // Rollup 打包配置
    rollupOptions: {
      output: {
        // 手动配置 chunk 分割策略
        manualChunks(id) {
          // Vue 核心库
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia')
          ) {
            return 'vue';
          }
          // VueUse 工具库
          if (id.includes('node_modules/@vueuse')) {
            return 'vueuse';
          }
          // 其他 node_modules 依赖
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
    // 压缩配置
    minify: 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.debug'], // 移除指定函数
      },
    },
    // 设置目标浏览器
    target: 'es2015',
    // 启用 CSS 压缩
    cssMinify: true,
  },
});
