---
title: 스벨트킷 블로그에 RSS 추가하기
publishedAt: '2022-04-02'
summary: 스벨트킷 블로그에 RSS 기능을 추가하는 방법
---
스벨트킷으로 만든 블로그에 RSS 기능을 추가하는 방법을 설명합니다.

## RSS란

RSS는 "Really Simple Syndication"의 약자이며 XML 문서의 일종입니다. 블로그 등의
웹사이트에서 RSS를 지원하면 https://feedly.com 같은 RSS 구독 서비스로 해당 사이트를
구독할 수 있게 해줍니다.

## 구현

RSS 형식에 맞는 XML 문자열을 생성해주는 라이브러리를 설치합니다.

```bash
npm i -D feed
```

이제 RSS 문서를 서빙하는 엔드포인트를 추가해야 합니다. 저는 `src/routes/rss.xml.ts` 파일을
추가하여 `/rss.xml` 엔드포인트를 만들었습니다.

```typescript
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
```

위 코드에서 임포트하고 있는 `getArticleMetas()` 함수에 대한 내용은
[스벨트킷으로 블로그 만들기](/posts/sveltekit-blog) 글을 참고해주세요.

## 정적 사이트에 배포하기

[표준에 의하면](https://www.rssboard.org/rss-mime-type-application.txt), RSS 문서의
MIME 타입은 `application/rss+xml`입니다. 이에 따라 위 코드에서도 응답 헤더에
`Content-Type: application/rss+xml; charset=utf-8`을 추가했습니다. 하지만 어차피 이
블로그는 **정적 사이트 생성static site generation**을 사용하기 때문에 스벨트킷에서 응답
헤더를 지정해도 별 소용이 없습니다.

정적 파일을 서빙할 때 몇몇 웹 서버는 파일 확장자에 기반해서 `Content-Type` 헤더를
추가해주기도 합니다. 이런 특성을 확용하기 위해 엔드포인트 주소를 `/rss`가 아닌 `/rss.xml`로
지정했습니다.

다만, 이 블로그를 배포하고 있는 CloudFlare Pages에서는 확장자가 `xml`인 파일도 그냥
`text/html`로 서빙하고 있었습니다. 다행히도
[검색을 해보니](https://developers.cloudflare.com/pages/platform/headers/)
`_headers`라는 파일을 만들어주면 CloufFlare Pages에도 원하는 커스텀 헤더를 추가할 수
있었습니다.

```yaml
/rss.xml
  Content-Type: application/rss+xml; charset=utf-8
```

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요.

## 관련 글

* [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
