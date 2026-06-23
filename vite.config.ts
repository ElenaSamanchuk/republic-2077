import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function pagesBase(): string {
  if (process.env.CAPACITOR === '1') return './';
  if (process.env.GITHUB_PAGES_BASE) return process.env.GITHUB_PAGES_BASE;
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  return '/republic-2077/';
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' && !process.env.CAPACITOR ? '/' : pagesBase(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-progress',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],
          utils: ['clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
}));
