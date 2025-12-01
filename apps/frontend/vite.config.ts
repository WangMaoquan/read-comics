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
      '@read-comics/types': path.resolve(
        __dirname,
        '../../packages/types/index.ts',
      ),
      '@utils-shared': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4399',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
