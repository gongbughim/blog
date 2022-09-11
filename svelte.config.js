import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import path from 'path'
import preprocess from 'svelte-preprocess'
import { fileURLToPath } from 'url'

import mdsvexConfig from './mdsvex.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess({
      postcss: {
        configFilePath: path.join(__dirname, 'postcss.config.js'),
      },
    }),
    mdsvex(mdsvexConfig),
  ],

  kit: {
    adapter: adapter(),
    trailingSlash: 'ignore',
  },
}

export default config
