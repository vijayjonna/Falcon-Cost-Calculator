import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        useCredentials: true,
        manifestFilename: 'manifest-blueprint.json',
        includeAssets: [
          'falcon-blueprint.ico',
          'falcon-32.png',
          'falcon-apple-touch-180.png',
          'falcon-blueprint.svg',
          'falcon-icon-144.png',
          'falcon-icon-192.png',
          'falcon-icon-256.png',
          'falcon-icon-512.png',
          'falcon-maskable-512.png',
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Falcon Cost Calculator',
          short_name: 'Falcon Calc',
          description:
            'Calculate custom interior project expenses room by room, with precise MDF/plywood, laminate, louvers, hardware, and separate box/frame labor cost estimates and per-room pricing overrides.',
          theme_color: '#184572',
          background_color: '#184572',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/falcon-icon-144.png',
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/falcon-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/falcon-icon-256.png',
              sizes: '256x256',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/falcon-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/falcon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
