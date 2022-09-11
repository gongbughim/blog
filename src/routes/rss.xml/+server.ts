import { Feed } from 'feed'

import conf from '$lib/conf'
import { getArticleMetas } from '$lib/server/article'

import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = async () => {
  const posts = await getArticleMetas('src/routes/posts')
  const feed = new Feed({
    title: conf.title,
    description: conf.description,
    id: conf.url,
    language: 'ko',
    copyright: conf.copyright,
    author: {
      name: conf.authorName,
      email: conf.authorEmail,
      link: conf.authorTwitter,
    },
  })
  posts.forEach(p => {
    feed.addItem({
      title: p.title,
      id: p.id,
      link: `${conf.url}/posts/${p.id}`,
      description: p.summary,
      date: new Date(p.publishedAt),
    })
  })

  return new Response(feed.rss2(), { headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
}
