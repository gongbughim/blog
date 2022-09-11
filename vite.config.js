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
  test: {
    globals: true,
    environment: 'jsdom',
  },
}

export default config
