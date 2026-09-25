import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('../frontend/src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['frontend/src/**/*.test.ts'],
    passWithNoTests: false,
    restoreMocks: true,
    clearMocks: true,
  },
});
