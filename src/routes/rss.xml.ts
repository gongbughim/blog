import type { RequestHandler } from '@sveltejs/kit'
import { Feed } from 'feed'

import conf from '$lib/conf'
import { getArticleMetas } from '$lib/server/article'

export const get: RequestHandler = async () => {
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
      link: conf.authroTwitter,
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

  return {
    body: feed.rss2(),
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  }
}
