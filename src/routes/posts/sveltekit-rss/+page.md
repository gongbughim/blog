---
title: 스벨트킷 블로그에 RSS와 사이트맵 추가하기
publishedAt: '2022-04-02'
modifiedAt: '2022-09-11'
summary: 스벨트킷 블로그에 RSS 및 사이트맵을 추가하는 방법
---

아래 내용은
[1.0.0-next.406](https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%401.0.0-next.406)
이후 버전을 반영하여 수정되었습니다. (2022-09-11 기준 최신 버전인 1.0.0-next.480 에서 잘 작동하는걸 확인했습니다)

`1.0.0-next-405` 또는 그 이전 버전에서 만든 프로젝트를 마이그레이션하려면 아래 링크를
참고해주세요.

- [스벨트킷의 공식 마이그레이션 가이드](https://github.com/sveltejs/kit/discussions/5774)
- [이 블로그의 기존 소스코드를 위 가이드에 따라 수정한 커밋 내역](https://github.com/gongbughim/blog/commit/9505163543bf2d813eac57e620e8a16fd9f0196f)

---

스벨트킷으로 만든 블로그에 RSS 및 사이트맵을 추가하는 방법을 설명합니다.

## RSS란

RSS는 "Really Simple Syndication"의 약자이며 XML 문서의 일종입니다. 블로그 등의
웹사이트에서 RSS를 지원하면 https://feedly.com 같은 RSS 구독 서비스로 해당 사이트를
구독할 수 있게 해줍니다.

## 구현

RSS 형식에 맞는 XML 문자열을 생성해주는 라이브러리를 설치합니다.

```bash
npm i -D feed
```

이제 RSS 문서를 서빙하는 엔드포인트를 추가해야 합니다. 저는
`src/routes/rss.xml` 디렉터리를 만들고 그 안에 `/+server.ts` 파일을 추가하여 `/rss.xml`
엔드포인트를 만들었습니다.

```typescript
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
```

위 코드에서 임포트하고 있는 `getArticleMetas()` 함수에 대한 내용은
[스벨트킷으로 블로그 만들기](/posts/sveltekit-blog) 글을 참고해주세요.

## 링크 추가하기

만든 XML의 URL을 아래와 같이 레이아웃에 추가해주면 각종 로봇이 RSS 피드를 발견할 수 있게
됩니다. 스벨트킷의 정적 생성 기능이 `/rss.xml` 파일을 생성하게 하기 위해서도 필요합니다.

```svelte
<svelte:head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
</svelte:head>
```

## 정적 사이트에 배포하기

[표준에 의하면](https://www.rssboard.org/rss-mime-type-application.txt), RSS 문서의
MIME 타입은 `application/rss+xml`입니다. 아지만 무슨 이유에서인지 이 MIME 타입을 쓰면
크롬에서 이 파일을 XML로 인식하지 못하는 문제가 있습니다. `application/xml` 또는
`text/xml`을 사용하면 잘 작동합니다.
[RFC7303 Section 4.3](https://www.rfc-editor.org/rfc/rfc7303#section-4.3)에
따르면 `text/xml`은 `application/xml`의 별칭입니다.

이에 따라 위 코드에서도 응답 헤더에 `Content-Type: text/xml; charset=utf-8`을
추가했습니다. 하지만 어차피 이 블로그는 **정적 사이트 생성static site generation**을
사용하기 때문에 스벨트킷에서 응답 헤더를 지정해도 별 소용이 없습니다.

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
  Content-Type: text/xml; charset=utf-8
```

## 사이트맵 만들기

기왕 RSS를 만들었으니 [사이트맵 프로토콜](https://www.sitemaps.org/)을 따르는 사이트맵
파일도 만들어주면 좋겠습니다. 사이트맵을 만들면 검색엔진최적화에 도움이 됩니다.

`src/sitemap.xml/+server.ts`를 생성하고 아래 내용을 적습니다.

```typescript
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
```

보통은 XML을 생성할 때 위와 같이 문자열을 직접 다루기보다는 XML 생성 라이브러리를 사용하는
편이 좋지만 사이트맵 XML은 워낙 단순하니까 그냥 문자열을 직접 만들었습니다.

RSS와 마찬가지로 이 파일도 `text/xml`로 서빙하기 위해 `/static/_headers`에 커스텀 헤더를
추가합니다.

```yaml
/rss.xml
  Content-Type: text/xml; charset=utf-8
/sitemap.xml
  Content-Type: text/xml; charset=utf-8
```

마지막으로, 레이아웃에도 링크를 추가해줍니다.

```svelte
<svelte:head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
</svelte:head>
```

## 마치며

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요.

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
