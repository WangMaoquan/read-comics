import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@read-comics/types': path.resolve(__dirname, 'packages/types'),
      '@read-comics/utils': path.resolve(__dirname, 'packages/utils'),
    },
  },
  test: {
    globals: true,
    pool: 'threads',
    setupFiles: 'scripts/setup-vitest.ts',
    sequence: {
      hooks: 'list',
    },
    include: ['apps/frontend/src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'coverage'],
  },
});
