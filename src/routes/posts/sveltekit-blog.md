---
title: 스벨트킷으로 블로그 만들기
publishedAt: '2022-04-01'
summary: 스벨트킷으로 블로그 만드는 과정을 기록했습니다.
---

[스벨트킷](https://kit.svelte.dev)은 [스벨트](https://svelte.dev) 기반의 웹
프레임워크입니다. 스벨트와 스벨트킷의 관계는 [리엑트](https://reactjs.org/)와
[넥스트JS](https://nextjs.org/)의 관계와 같습니다.

이 글에서는 스벨트킷을 이용하여 마크다운 기반의 블로그를 만들고 CloudFlare Pages에 배포하는
방법을 소개합니다. 무료로 이용할 수 있는 서비스만 사용합니다.

## 스벨트킷 설치하기

노드JS 16 또는 그 이상의 버전이 설치되어 있어야 합니다. 이 글을 쓰는 현재(2022-04-01) 제
컴퓨터에는 `v17.8.0`이 설치되어 있습니다. 아래 명령으로 버전을 확인할 수 있습니다.

```bash
node -v
```

프로젝트를 생성할 디렉터리로 이동합니다. 저는 프로젝트를 `~/prjs`에 모아둡니다.

```bash
cd ~/prjs
```

스벨트킷 홈페이지의 안내에 따라 스벨트킷을 설치합니다. 저는 `blog`라는 이름으로 프로젝트를
만들었습니다.

```bash
npm init svelte@next blog
```

위 명령을 실행하면 몇 가지를 물어보는데 저는 이렇게 답했습니다.

- Which Svelte app template? (어떤 템플릿을 사용하시겠습니까?) **Skeleton project**<br>
  (예제 파일들이 없는 빈 프로젝트를 만들고 싶어서 이 템플릿을 골랐습니다)
- Use TypeScript? (타입스크립트를 사용하시겠습니까?) **Yes**<br>
  (간단한 블로그라서 타입스크립트를 꼭 쓰지 않아도 괜찮지만, 자꾸 쓰면서 익히고 싶은 마음에
  "Yes"를 선택했습니다.)
- Add ESLint for code linting? (ESLint를 사용하시겠습니까?) **Yes**<br>
  (저는 되도록 모든 프로젝트에서 린터를 사용하면 좋다고 생각합니다.)
- Add Prettier for code formatting? **Yes**<br>
  (저는 되도록 모든 프로젝트에서 포멧터를 사용하면 좋다고 생각합니다.)
- Add Playwright for browser testing? **No**<br>
  (간단한 블로그니까 테스트를 만들지 않을 생각입니다. 만들더라도 브라우저 테스트보다는 가벼운
  단위 테스트를 먼저 만들면 좋다고 생각합니다.)

```
✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … No
```

이제 프로젝트 디렉터리가 생겼습니다. 개발 서버를 실행하고 브라우저에서 확인해보겠습니다.

```bash
cd blog
npm i
npm run dev -- --open
```

"Welcome to SvelteKit"이라는 문서가 열리면 성공입니다.

Visual Studio Code에서 이 디렉터리를 열고 `src/routes/index.svelte`를 열어보면 에러
가 뜹니다. 타입스크립트 설정 파일인 `tsconfig.json`을 열어보면 아래와 같이
`.svelte-kit/tsconfig.json`을 확장하고 있으나, 해당 파일이 아직 존재하지 않기 때문입니다.

```json
{
  "extends": "./.svelte-kit/tsconfig.json"
}
```

다음 명령을 실행하면 이 파일이 만들어집니다.

```bash
npm run build
```

VSCode를 재시작하거나 "Developer: Reload Window"를 선택하면 에러가 사라집니다.

## 정적 사이트 생성하기

스벨트킷은 서버측 랜더링server-side rendering, 클라이언트측 렌더링client-side rendeing,
사전생성pregeneration을 모두 지원합니다. 우리는 정적 블로그 사이트를 만들 것이므로, 모든
페이지를 사전 생성하고자 합니다. 이를 **정적 사이트 생성static site generation**이라고
부릅니다.

스벨트킷에서 기본으로 제공하는 어뎁터(`@sveltejs/adapter-auto`)를 제거하고 정적 사이트
생성 어뎁터(`@sveltejs/adapter-static`)를 설치합니다.

```bash
npm uninstall @sveltejs/adapter-auto
npm i -D @sveltejs/adapter-static@next
```

빌드를 해보면 실제로 정적 사이트 생성이 잘 작동하는지 확인해볼 수 있습니다.

```bash
npm run build
```

`build`라는 이름의 디렉터리가 생기고 해당 디렉터리 안에 `index.html`을 포함한 정적 파일들이
생성되었습니다. 다음 명령으로 정적 사이트를 열어볼 수 있습니다.

```bash
npm run preview
```

`npm run dev`를 했을 때와 겉보기엔 같아 보이지만, 모든 페이지가 정적으로 생성되었고 서버
측에서는 어떠한 코드도 실행되지 않는다는 차이가 있습니다.

빈 웹사이트를 만들었지만 아직은 제 컴퓨터에서만 접속할 수 있습니다. 세상 누구나 내 웹 사이트에
접속할 수 있도록 하려면 인터넷에 연결된 서버에 `build` 디렉터리의 파일들을 업로드해야 합니다.
이를 **배포deployment**라고 부릅니다.

## CloudFlare Pages에 배포하기

배포는 되도록 빠르게 자주 할수록 좋습니다. 방금 만든 프로젝트를 깃헙에 올린 후
[CloudFlare Pages](https://pages.cloudflare.com/)에 배포하도록 하겠습니다.
CloudFlare Pages에는 여러 기능이 있지만 일단은 두 가지 용도로만 쓰려고 합니다.

- 깃헙에 소스코드를 커밋하면 자동으로 사이트를 빌드하기
- 빌드한 정적 사이트를 빠르고 안정적으로 호스팅하기

[GitHub Pages](https://pages.github.com/), [Vercel](https://vercel.com/),
[Netlify](https://netlify.com/) 등 다른 서비스를 이용해도 되지만, 공부도 할 겸 아직
사용해보지 않은 CloudFlare Pages를 선택했습니다.

다음 절차대로 설정하세요.

1. 우선 깃헙에 새 저장소를 만들고 코드를 올립니다.
2. https://pages.cloudflare.com/ 에서 계정을 만듭니다.
3. 새 프로젝트를 생성하고 깃헙에 만든 저장소와 선택한 후 "Begin Setup"을 클릭합니다.
4. "Framework preset"은 "None"을 선택합니다. 선택지 중 스벨트킷도 있지만 정적 사이트로만
   쓸 계획이니까 그냥 "None"을 고릅니다. "Build command"는 `npm run build`,
   "Build output directory"는 `build`를 선택합니다.
5. "Environment variables"에 `NODE_VERSION` 변수를 추가하고 값은 `16`을 입력합니다.

프로젝트 이름에 따라 자동으로 도메인 이름을 생성해주는데, 남들이 아직 선택하지 않은 이름을
잘 고르면 짧고 깔끔한 도메인을 받을 수 있습니다. 저는 `gbg`를 골라서
https://gbg.pages.dev 주소가 생겼습니다.

설정을 약 30초에서 1분 정도 기다리면 배포가 끝납니다. 이제 누구나 접속할 수 있는 내 웹
사이트가 생겼습니다. 앞으로는 깃헙에 코드를 푸시하기만 하면 1분 이내로 내용이 반영됩니다. 이를
**지속적인 배포continuous deployment**라고 부릅니다.

## 마크다운 설정하기

스벨트킷에서 마크다운을 쓰려면 보통 [mdsvex](https://mdsvex.com/)를 설치합니다. mdsvex를
쓰면 아래와 같이 마크다운 문서 중간에 스벨트 컴포넌트를 넣을 수 있어서 좋습니다.
[MDX](https://mdxjs.com/)의 스벨트 버전이라고 생각하시면 됩니다.

```markdown
# mdsvex

마크다운 문서에 스벨트 컴포넌트를 넣기

<SomeComponent value={1+2} />
```

우선 mdsvex 및 관련 패키지들을 설치합니다.

```bash
npm i -D mdsvex rehype-autolink-headings rehype-slug remark-abbr
```

`svelte.config.js` 파일을 아래와 같이 수정합니다.

```js
import { fileURLToPath } from 'url'
import { mdsvex } from 'mdsvex'
import adapter from '@sveltejs/adapter-static'
import path from 'path'
import preprocess from 'svelte-preprocess'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess(),
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
  },
}

export default config
```

`src/components/LayoutDefault.svelte`는 마크다운 포스트 페이지들의 기본 레이아웃을
렌더링하는 컴포넌트인데 아직 파일을 만들지 않았으니 만들어주겠습니다.
`src/components` 디렉터리를 만들고 `LayoutDefault.svelte` 파일을 만듭니다.

```svelte
<script>
  export let title = ''
  export let summary = ''
  export let publishedAt = ''
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={summary} />
</svelte:head>

<article class="post">
  <h1>{title}</h1>
  <p class="info">
    <time>{publishedAt}</time>
  </p>
  <slot />
</article>

<style>
  .info {
    margin: 1em 0 6em;
  }
</style>
```

컴포넌트의 속성으로 `title`, `summary`, `publishedAt`이 명시되어 있는데, 이 속성들은
마크다운 파일의 프론트매터frontmatter를 파싱하여 자동으로 설정됩니다.

이제 준비가 끝났으니 첫 포스트를 작성해보겠습니다.

`src/routes/posts` 디렉터리를 만들고 `hello.md` 파일을 만듭니다.

```markdown
---
title: 제목
summary: 요약
publishedAt: '2020-04-01'
---

*안녕*하세요.
```

`npm run dev`로 개발 서버를 실행하고 브라우저에서
`http://localhost:3000/posts/hello`로 접속하면 렌더링된 페이지를 확인할 수 있습니다.

## 인덱스 페이지 만들기

블로그 첫 페이지에서는 보통 글 목록을 보여줍니다. 이를 인덱스 페이지라고 부릅니다. 서버측
API를 만들어서 마크다운 파일들을 자동으로 스캔하도록 하면 인덱스 페이지를 쉽게 구현할 수
있습니다.

서버측 렌더링 모드 또는 클라이언트측 렌더링 모드에서는 사용자가 첫 페이지에 접속할 때마다
이 API가 호출되겠지만, 우리는 정적 사이트 생성을 하기 때문에 이 API는 `npm run build`를
할 때에만 호출이 됩니다.

스벨트킷에서 서버측 API를 만드는 방법은 간단합니다. `src/routes` 디렉터리에 `*.svelte`
파일이나 `*.md` 파일을 만들면 "페이지"로 인식이 되고, `*.ts` 파일을 만들면 API 엔드포인트로
인식이 됩니다. 따라서 우리는 `*.ts` 파일을 만들면 됩니다.

한편, 페이지와 동일한 이름의 API 엔드포인트를 만들면 해당 페이지를 스벨트킷이 렌더링할 때
자동으로 API 엔드포인트를 실행하고 그 결과를 속성으로 대입해줍니다. (2022년 3월에
[새로 추가된 기능](https://github.com/sveltejs/kit/pull/3679)입니다.) 이 기능을
이용해보겠습니다.

우선 마크다운의 프론트매터를 파싱하여 제목, 요약, 발행일 등을 얻어내기 위해 필요한 패키지를
설치합니다.

```bash
npm i -D js-yaml
```

`src/routes/index.svelte` 파일에서 기존 코드를 모두 지우고 아래 코드를 적습니다.

```svelte
<script lang="ts">
  import type { ArticleMeta } from '$lib/types'

  export let posts: ArticleMeta[] = []
</script>

<svelte:head>
  <title>웹사이트 제목</title>
  <meta name="description" content="웹사이트 설명" />
</svelte:head>

<h1>웹사이트 제목</h1>

<ul class="posts">
  {#each posts as post}
    <li>
      <article>
        <h2 class="title"><a href={`/posts/${post.id}`}>{post.title}</a></h2>
        <time class="published-at">{post.publishedAt}</time>
        <p class="summary">{post.summary}</p>
      </article>
    </li>
  {/each}
</ul>
```

API 엔드포인트인 `src/routes/index.ts` 파일도 만들어줍니다.

```typescript
import type { RequestHandler } from '@sveltejs/kit'
import fs from 'fs'
import yaml from 'js-yaml'

import type { ArticleMeta } from '$lib/types'

export const get: RequestHandler = async () => {
  const posts = await getArticleMetas('src/routes/posts')
  return {
    body: { posts },
  }
}

export async function getArticleMetas(dir: string): Promise<ArticleMeta[]> {
  const promises = (await fs.promises.readdir(dir))
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .map(id => getArticleMeta(dir, id))
  return (await Promise.all(promises)).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export async function getArticleMeta(dir: string, id: string): Promise<ArticleMeta> {
  const content = (await fs.promises.readFile(`${dir}/${id}.md`)).toString()
  const frag = content.substring(4, content.indexOf('---\n', 4)).trim()
  return { id, ...(yaml.load(frag) as Record<string, string>) } as ArticleMeta
}
```

마지막으로, `index.svelte`와 `index.ts`에서 참조할 `src/lib/types.ts` 파일을 만듭니다.

```typescript
export type ArticleMeta = {
  id: string
  title: string
  publishedAt: string
  summary: string
}
```

이제 `http://localhost:3000`에 접속하면 글 목록이 나옵니다.

## 나머지 작업들

코드 품질을 잘 관리하고 개발 환경을 더 편리하게 개선하려면 아래와 같이 다양한 설정을 추가하면
좋습니다.

- Visual Studio Code 설정
- prettier 설정
- stylelint 설정
- eslint 설정
- pre-commit hook 설정
- Github Actions 기반 지속적 통합continuous integration 설정
- 단위 테스트 프레임워크 설정

이런 각종 설정들은 [이 블로그의 소스코드](https://github.com/gongbughim/blog)에서
확인하시기 바랍니다.

## 관련 글

- [스벨트킷+mdsvex 프리페치 설정하기](/posts/mdsvex-prefetch)
- [스벨트킷 블로그에 RSS 추가하기](/posts/sveltekit-rss)
