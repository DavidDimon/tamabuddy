/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;
const isTauriDebug = process.env.TAURI_ENV_DEBUG === 'true';

export default defineConfig(({ command }) => {
  const isProductionBuild = command === 'build' && !isTauriDebug;

  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/tamabuddy-desktop',
    clearScreen: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        isProductionBuild ? 'production' : 'development',
      ),
    },
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
      minify: !isTauriDebug,
      sourcemap: isTauriDebug,
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
        thresholds: {
          branches: 70,
          functions: 84,
          lines: 82,
          statements: 80,
        },
      },
    },
  };
});
