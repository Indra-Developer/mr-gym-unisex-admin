import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'MR GYM Admin',
        short_name: 'MR GYM',
        description: 'Gym Management Dashboard',
        theme_color: '#2563EB',
        background_color: '#F7F8FA',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      },
      // INCREASE CACHE LIMIT TO 3MB
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000 
      }
    })
  ]
});