import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['icons/pwa-icon.svg'],

      manifest: {
        name: '몽글',
        short_name: '몽글',
        description: '꿈을 기록하고 나만의 Dream World를 만들어가는 서비스',

        theme_color: '#0b0710',
        background_color: '#0b0710',

        display: 'standalone',
        orientation: 'portrait',

        start_url: '/',
        scope: '/',

        lang: 'ko-KR',

        icons: [
          {
            src: '/icons/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,avif,woff2}'],

        navigateFallback: '/index.html',

        cleanupOutdatedCaches: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
