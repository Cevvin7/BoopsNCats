import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { itemCatalogPlugin } from './vite-plugins/itemCatalogPlugin.js';

// GitHub Pages serves a project repo like this one from a subpath
// (https://cevvin7.github.io/BoopsNCats/), not the domain root, so every
// asset URL the production build generates needs a /BoopsNCats/ prefix —
// otherwise the deployed page 404s on all its JS/CSS/icons. Dev mode keeps
// serving from "/" so the local workflow (npm run dev) is unaffected; only
// `vite build` (what CI runs) picks up the prefix. If this repo is ever
// renamed again, this constant needs to match the new name.
const GITHUB_PAGES_BASE = '/BoopsNCats/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
  test: {
    environment: 'jsdom',
  },
  plugins: [
    react(),
    itemCatalogPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'BoopsNCats',
        short_name: 'BoopsNCats',
        description: 'Turn real-world distance into Boops and care for your cat.',
        theme_color: '#2b2d42',
        background_color: '#2b2d42',
        display: 'standalone',
        start_url: command === 'build' ? GITHUB_PAGES_BASE : '/',
        scope: command === 'build' ? GITHUB_PAGES_BASE : '/',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
}));
