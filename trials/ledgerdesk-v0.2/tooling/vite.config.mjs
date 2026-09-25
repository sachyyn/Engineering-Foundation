import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('../frontend', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('../frontend/src', import.meta.url)) },
  },
  server: { host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:8000' } },
  build: { sourcemap: false },
});
