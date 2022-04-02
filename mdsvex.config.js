import path from 'path'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatexSvelte from 'rehype-katex-svelte'
import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  extensions: ['.md'],
  smartypants: {
    dashes: 'oldschool',
  },
  remarkPlugins: [remarkMath, remarkAbbr],
  rehypePlugins: [
    rehypeKatexSvelte,
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    () => {
      // Attach "sveltekit:prefetch" to internal links
      return tree => {
        const pInnerLink = /^(\/|\.)/
        visit(tree, 'element', node => {
          if (node.tagName !== 'a') return
          if (!node.properties.href.match(pInnerLink)) return
          node.properties['sveltekit:prefetch'] = 'sveltekit:prefetch'
        })
      }
    },
  ],
  layout: {
    _: path.join(__dirname, './src/components/LayoutDefault.svelte'),
  },
}

export default config
