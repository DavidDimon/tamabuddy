/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const lifeLabModule = 'virtual:life-lab';
const resolvedLifeLabModule = `\0${lifeLabModule}`;

export default defineConfig(({ command }) => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/tamabuddy-web',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    {
      name: 'dev-only-life-lab',
      resolveId(id) {
        return id === lifeLabModule ? resolvedLifeLabModule : undefined;
      },
      load(id) {
        if (id !== resolvedLifeLabModule) return undefined;
        return command === 'build'
          ? 'export const LifeLab = null;'
          : 'export { LifeLab } from "/src/features/life-lab/LifeLab.tsx";';
      },
    },
    react(),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@tamabuddy/tamabuddy-web',
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
