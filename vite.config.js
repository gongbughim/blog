import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/components'),
      $assets: path.resolve('./src/assets'),
    },
  },
  build: {
    chunkSizeWarningLimit: '600KB',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
}

export default config
