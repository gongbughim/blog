---
title: 스벨트킷으로 블로그 만들기
publishedAt: '2022-04-01'
modifiedAt: '2022-09-11'
summary: 스벨트킷으로 블로그 만드는 과정을 기록했습니다.
---

<script>
  import Asciinema from '$components/Asciinema.svelte'
</script>

아래 내용은 스벨트킷 1.0 버전을 반영하여 수정되었습니다.

`1.0.0-next-405` 또는 그 이전 버전에서 만든 프로젝트를 마이그레이션하려면 아래 링크를
참고해주세요.

- [스벨트킷의 공식 마이그레이션 가이드](https://github.com/sveltejs/kit/discussions/5774)
- [이 블로그의 기존 소스코드를 위 가이드에 따라 수정한 커밋 내역](https://github.com/gongbughim/blog/commit/9505163543bf2d813eac57e620e8a16fd9f0196f)

---

[스벨트킷](https://kit.svelte.dev)은 [스벨트](https://svelte.dev) 기반의 웹
프레임워크입니다. 스벨트와 스벨트킷의 관계는 [리엑트](https://reactjs.org/)와
[넥스트JS](https://nextjs.org/)의 관계와 같습니다.

이 글에서는 스벨트킷을 이용하여 마크다운 기반의 블로그를 만들고 CloudFlare Pages에 배포하는
방법을 소개합니다. 무료로 이용할 수 있는 서비스만 사용합니다.

## 스벨트킷 설치하기

스벨트킷은 노드JS 16 또는 18을 지원합니다. 노드JS 17은 지원하지 않으므로 유의해야 합니다.

이 글을 쓰는 현재(2022-09-11) 제 컴퓨터에는 `v18.8.0`이 설치되어 있습니다. 아래 명령으로 버전을
확인할 수 있습니다.

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
  단위 테스트를 먼저 만들면 좋다고 생각합니다. 관련글:
  [스벨트킷 블로그 단위 테스트하기](/posts/mdsvex-unit-testing))

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

"Welcome to SvelteKit"이라는 문서가 열리면 성공입니다. 다음은 지금까지 설명한 내용을 녹화한
화면입니다.

<Asciinema id="YWBf6amaVVbWTeLgt7nwm7iFG" speed={1.5} />

## 경로 별칭 설정하기

`vite.config.js`를 수정하여 자주 쓰는 경로의 별칭을 만들어주면 `import`를 편리하게 할 수
있습니다.

```js
import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/components'),
      $assets: path.resolve('./src/assets'),
    },
  },
}

export default config
```

## 정적 사이트 생성하기

스벨트킷은 서버측 랜더링server-side rendering, 클라이언트측 렌더링client-side rendeing,
사전생성pregeneration을 모두 지원합니다. 우리는 정적 블로그 사이트를 만들 것이므로, 모든
페이지를 사전 생성하고자 합니다. 모든 페이지를 사전 생성하면
**정적 사이트 생성static site generation**이라고 부릅니다.

정적 사이트 생성 어뎁터(`@sveltejs/adapter-static`)를 설치하고, 설정을 변경한 뒤,
스벨트킷에서 기본으로 제공하는 어뎁터(`@sveltejs/adapter-auto`)를 제거하겠습니다.

우선 정적 사이트 생성 어뎁터를 설치합니다.

```bash
npm i -D @sveltejs/adapter-static@next
```

이제 `svelte.config.js` 파일을 열어서 `import` 부분을 수정합니다.

```js
// adapter-auto 대신 adapter static
import adapter from '@sveltejs/adapter-static'
```

모든 경로에 대하여 정적 생성 옵션을 한 번에 적용하기 위해 `routes/+layout.ts` 파일을
생성하고 아래 내용을 적어줍니다.

```ts
export const prerender = true
```

마지막으로, `@sveltejs/adapter-auto`를 제거합니다.

```
npm uninstall @sveltejs/adapter-auto
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
   (2022년 9월 현재 Cloudflare Pages 빌드 환경은 노드 18 버전을 아직 지원하지 않습니다.
   스벨트킷은 노드 16과 18을 지원합니다. NVM을 사용하여 노드 18 버전을 설치하는 방법이 있지만
   꼭 노드 18이 필요하지는 않으므로 그냥 16을 사용합니다.)

프로젝트 이름에 따라 자동으로 도메인 이름을 생성해주는데, 남들이 아직 선택하지 않은 이름을
잘 고르면 짧고 깔끔한 도메인을 받을 수 있습니다. 저는 `gbg`를 골라서
https://gbg.pages.dev 주소가 생겼습니다.

설정을 마치고 약 30초에서 1분 정도 기다리면 배포가 끝납니다. 이제 누구나 접속할 수 있는 내 웹
사이트가 생겼습니다. 앞으로는 깃헙에 코드를 푸시하기만 하면 1분 이내로 내용이 반영됩니다. 이를
**지속적인 배포continuous deployment**라고 부릅니다.

## 마크다운 설정하기

스벨트킷에서 마크다운을 쓰려면 보통 [mdsvex](https://mdsvex.com/)를 설치합니다. mdsvex를
쓰면 마크다운 문서 중간에 아래와 같이 스벨트 컴포넌트를 넣을 수 있어서 좋습니다.
[MDX](https://mdxjs.com/)의 스벨트 버전이라고 생각하시면 됩니다.

```markdown
# mdsvex

마크다운 문서에 스벨트 컴포넌트를 넣기

<SomeComponent value={1+2} />
```

우선 mdsvex 및 관련 패키지들을 설치합니다. (2022-09-11일 현재 `remark-math` 최신 버전은
`mdsvex`와 호환성 문제가 발생하므로 `remark-math@3`를 설치합니다.)

```bash
npm i -D mdsvex rehype-autolink-headings rehype-katex rehype-katex-svelte rehype-slug remark-abbr remark-math@3
```

프로젝트 루트에 `mdsvex.config.js` 파일을 추가하여 마크다운 설정을 적어줍니다.

```js
import path from 'path'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatexSvelte from 'rehype-katex-svelte'
import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr'
import remarkMath from 'remark-math'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  extensions: ['.md'],
  smartypants: {
    dashes: 'oldschool',
  },
  remarkPlugins: [remarkMath, remarkAbbr],
  rehypePlugins: [rehypeKatexSvelte, rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
  layout: {
    _: path.join(__dirname, './src/components/LayoutDefault.svelte'),
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

이제 `svelte.config.js` 파일을 아래와 같이 수정하여 위 설정을 연결해줍니다.

```js
import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'

import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [preprocess(), mdsvex(mdsvexConfig)],

  kit: {
    adapter: adapter(),
  },
}

export default config
```

이제 준비가 끝났으니 첫 포스트를 작성해보겠습니다.

`src/routes/posts/hello` 디렉터리를 만들고 `+page.md` 파일을 만듭니다.

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
할 때에만 해당 코드가 실행되고, 런타임에는 빌드 당시에 만들어진 정적 페이지들만 전송 됩니다.

스벨트킷에서 서버측 API를 만드는 방법은 간단합니다. `src/routes` 디렉터리에 `+page.svelte`
파일이나 `+page.md` 파일을 만들면 "페이지"로 인식이 되고, `+page.server.ts` 파일을 만들면
API 엔드포인트로 인식이 됩니다. 따라서 우리는 `+page.server.ts` 파일을 만들면 됩니다.

한편, 이렇게 만들어진 API 엔드포인트는 해당 페이지를 스벨트킷이 렌더링할 때 자동으로 실행되고
그 결과가 페이지의 `data` 속성으로 대입됩니다. 이 기능을 이용해보겠습니다.

우선 마크다운의 프론트매터를 파싱하여 제목, 요약, 발행일 등을 얻어내기 위해 필요한 패키지를
설치합니다.

```bash
npm i -D js-yaml @types/js-yaml
```

`src/routes/+page.svelte` 파일에서 기존 코드를 모두 지우고 아래 코드를 적습니다.

```svelte
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
  let posts = data.posts
  let publishedPosts = posts.filter(p => !p.draft)
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

API 엔드포인트인 `src/routes/+page.server.ts` 파일도 만들어줍니다.

```typescript
import { getArticleMetas } from '$lib/server/article'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const posts = await getArticleMetas('src/routes/posts')
  return { posts }
}
```

이제 `src/lib/server` 폴더를 만들고 `article.ts` 파일을 생성합니다.

```typescript
import fss from 'fs'
import fs from 'fs/promises'
import yaml from 'js-yaml'

/** Meatadata of article */
export type ArticleMeta = {
  /** Article ID */
  id: string
  /** Title */
  title: string
  /** Published date as YYYY-MM-DD form */
  publishedAt: string
  /** Modified datetime as ISO format */
  modifiedAt: string
  /** Short summary in plain text */
  summary: string
  /** Draft flag */
  draft: boolean
}

/**
 * Extract metadata of all articles with the directory
 * @param dir A path
 * @returns Metadata of all articles
 */
export async function getArticleMetas(dir: string): Promise<ArticleMeta[]> {
  const promises = (await fs.readdir(dir))
    .filter(f => fss.existsSync(`${dir}/${f}/+page.md`))
    .map(id => getArticleMeta(dir, id))
  return (await Promise.all(promises)).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

/**
 * Extract metadata from directory and article id
 * @param dir A path
 * @param id Article ID
 * @returns Metadata of article
 */
export async function getArticleMeta(dir: string, id: string): Promise<ArticleMeta> {
  const filepath = `${dir}/${id}/+page.md`
  const f = await fs.readFile(filepath)
  const mtime = (await fs.stat(filepath)).mtime

  return extractMeta(id, f.toString(), mtime)
}

/**
 * Extract metadata from markdown file.
 * @param id Article ID
 * @param markdown Raw markdown content
 * @returns Metadata of article
 */
export function extractMeta(id: string, markdown: string, mtime: Date): ArticleMeta {
  const S = '---\n' // separator
  const raw = markdown.substring(S.length, markdown.indexOf(S, S.length)).trim()
  const frontmatter = yaml.load(raw) as Record<string, any>
  return {
    ...frontmatter,
    id,
    draft: !!frontmatter.draft,
    modifiedAt: mtime.toISOString(),
  } as ArticleMeta
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
- [스벨트킷 블로그 단위 테스트하기](/posts/mdsvex-unit-testing)
- [동적 컬러 팔레트](/posts/dynamic-color-palette)
- [다크모드 지원하기](/posts/dark-mode)
- [스벨트킷+WASM](/posts/sveltekit-wasm)
- [Svelte Cubed 기반의 3D 그래픽스](/posts/svelte-cubed)
- [Graphviz 연결하기](/posts/graphviz)
