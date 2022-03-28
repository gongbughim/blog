import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import path from 'path'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr'
import preprocess from 'svelte-preprocess'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess({
      postcss: {
        configFilePath: path.join(__dirname, 'postcss.config.js'),
      },
    }),
    mdsvex({
      extensions: ['.md'],
      smartypants: {
        dashes: 'oldschool',
      },
      remarkPlugins: [remarkAbbr],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
      layout: {
        _: path.join(__dirname, './src/components/LayoutDefault.svelte'),
      },
    }),
  ],

  kit: {
    adapter: adapter(),
    prerender: {
      default: true,
    },
    vite: {
      resolve: {
        alias: {
          $components: path.resolve('./src/components'),
        },
      },
      test: {
        globals: true,
        environment: 'jsdom',
      },
    },
    trailingSlash: 'ignore',
  },
}

export default config
