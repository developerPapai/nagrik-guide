import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,woff2,svg,png}'],
      },
      manifest: {
        name: 'Nagrik Guide',
        short_name: 'Nagrik Guide',
        description: 'Offline legal information',
        display: 'standalone',
        start_url: './',
        scope: './',
        background_color: '#f7f8f4',
        theme_color: '#1e5d54',
        icons: [
          { src: './icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: './icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
