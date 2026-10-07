/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/tamabuddy-desktop',
  clearScreen: false,
  server: {
    port: 4210,
    strictPort: true,
    host: host ?? '127.0.0.1',
    hmr:
      host === undefined
        ? undefined
        : {
            protocol: 'ws',
            host,
            port: 4211,
          },
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  preview: {
    port: 4310,
    host: 'localhost',
  },
  plugins: [react()],
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    target:
      process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG,
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@tamabuddy/tamabuddy-desktop',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
