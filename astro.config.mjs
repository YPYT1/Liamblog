// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://liamwang.online',
  trailingSlash: 'never',
  output: 'server',
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    server: {
      port: 4321,
      strictPort: true,
      origin: 'http://localhost:4321',
      hmr: {
        host: 'localhost',
        protocol: 'ws',
        clientPort: 4321,
        port: 4321,
      },
    },
  },

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
