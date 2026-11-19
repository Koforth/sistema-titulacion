/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    // En desarrollo, /api se redirige al backend Laravel (php artisan serve)
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' },
});