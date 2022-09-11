import conf from '$lib/conf'
import { getArticleMetas } from '$lib/server/article'

import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = async () => {
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
  return new Response(xml, { headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
}
