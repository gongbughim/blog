import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import postcssPresetEnv from 'postcss-preset-env'
import preprocess from 'svelte-preprocess'

import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess({
      postcss: {
        plugins: [
          postcssPresetEnv({
            browsers: '> 1% and last 3 versions',
            features: {
              'nesting-rules': true,
              'media-query-ranges': true,
            },
          }),
        ],
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
