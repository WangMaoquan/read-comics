import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    splitting: true,
    sourcemap: false,
    treeshake: true,
    external: ['axios'],
    target: 'es2020',
    clean: true,
    outDir: 'dist/cjs',
    format: ['cjs'],
  },
  {
    entry: ['src/index.ts'],
    splitting: true,
    sourcemap: false,
    treeshake: true,
    external: ['axios'],
    target: 'es2020',
    clean: true,
    outDir: 'dist/esm',
    format: ['esm'],
  },
  {
    entry: ['src/index.ts'],
    dts: {
      only: true,
    },
  },
]);
