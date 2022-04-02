import type { RequestHandler } from '@sveltejs/kit'

import { getArticleMetas } from '$lib/server/article'

export const get: RequestHandler = async () => {
  const posts = await getArticleMetas('src/routes/posts')
  return {
    body: { posts },
  }
}
