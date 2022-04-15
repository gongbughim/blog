import type { RequestHandler } from '@sveltejs/kit'

import conf from '$lib/conf'
import { getArticleMetas } from '$lib/server/article'

export const get: RequestHandler = async () => {
  const posts = await getArticleMetas('src/routes/posts')
  const links = posts.map(
    p => `
    <sitemap>
      <loc>${conf.url}/posts/${p.id}</loc>
      <lastmod>${p.modifiedAt}</lastmod>
    </sitemap>
  `,
  )
  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${links.join('')}
    </sitemapindex>
  `.trim()
  return {
    body: xml,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  }
}
