---
title: 스벨트킷 블로그 단위 테스트하기
publishedAt: '2022-04-03'
summary: 스벨트킷으로 만든 블로그에 단위 테스트를 적용하는 방법
---

[스벨트킷으로 블로그 만들기](/posts/sveltekit-blog) 글과 이어지는 내용입니다. 이 글에서는
이렇게 만들어진 블로그에 단위 테스트를 적용하는 방법을 설명합니다.

## 단위 테스트란

단위 테스트unit test는 소프트웨어의 개별 모듈들이 의도한 방식대로 작동하는지 확인하는
절차입니다. 과거에는 사람이 수동으로 테스트를 했지만 요즘에는 **자동화된 단위 테스트automated
unit test** 코드를 만들어서 실행하는 방식을 더 선호하며, 특별히 언급하는 경우를 빼면
'단위 테스트'는 모두 '자동화된 단위 테스트'를 말합니다.

## 타입스크립트 단위 테스트

스벨트킷은 [vite](https://vitejs.dev/)를 사용하기 때문에 단위 테스트 프레임워크로
[vitest](https://vitest.dev/)를 사용하면 호환이 잘 되어서 편리합니다.

```bash
npm i -D vitest
```

이제 프로젝트 루트 디렉터리에 있는 `vite.config.js`에 테스트 관련 설정을 추가해줍니다.

```js
const config = {
  // ... 생략
  test: {
    globals: true,
    environment: 'jsdom',
  },
}
```

그리고 `package.json`에 테스트 스크립트를 추가해줍니다.

```json
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest"
  }
}
```

`npm run test`를 입력하면 테스트가 1회 실행되고, `npm run test:watch`를 실행하면
파일이 바뀌면 자동으로 테스트를 실행해줍니다. watch 모드는 특히
**테스트 주도 개발test-driven development**을 할 때 좋습니다.

다만, 아직 테스트 케이스가 없기 때문에 에러가 납니다. 환경 설정이 끝났으니 테스트를 추가할
차례입니다. 마침 마크다운 파일에서 메타데이터를 추출하는 코드가 있는데, 이 코드에 대한 테스트를
붙여보면 좋겠습니다.

다음은 `src/lib/server/article.ts`의 일부입니다.

```ts
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

이제 위 코드를 테스트하는 `src/lib/server/article.test.ts` 파일을 추가하겠습니다.

```typescript
import dedent from 'dedent'
import { describe, expect, test } from 'vitest'

import { type ArticleMeta, extractMeta } from './article'

describe('extractMeta()', () => {
  test('Basic', () => {
    const md = dedent`
      ---
      title: TITLE
      summary: SUMMARY
      publishedAt: '2022-04-01'
      draft: true
      ---
      Hello
    `
    const actual = extractMeta('ID', md, new Date('2022-04-01T00:00:00.000Z'))
    const expected: ArticleMeta = {
      id: 'ID',
      title: 'TITLE',
      summary: 'SUMMARY',
      publishedAt: '2022-04-01',
      modifiedAt: '2022-04-01T00:00:00.000Z',
      draft: true,
    }
    expect(actual).toEqual(expected)
  })

  test('"draft" should be false if omitted', () => {
    const md = dedent`
      ---
      title: TITLE
      summary: SUMMARY
      publishedAt: '2022-04-01'
      ---
      Hello
    `
    expect(extractMeta('ID', md, new Date('2022-04-01T00:00:00.000Z')).draft).toBe(false)
  })
})
```

위 테스트에서는 `dedent`라는 태그드 템플릿tagged template을 사용하고 있습니다.
자바스크립트에서 멀티라인 문자열을 깔끔하게 쓸 수 있게 해주는 라이브러리입니다. 아래 명령으로
설치하시면 됩니다.

```bash
npm i -D dedent
```

이제 `npm run test`을 실행하면 1개의 테스트 파일에 담긴 2개의 테스트 케이스가 통과했다고
나옵니다.

## 마크다운 문서 단위 테스트

마크다운 문서는 어떻게 테스트를 하면 좋을까요? [mdsvex](https://mdsvex.pngwn.io/)
라이브러리를 설정했기 때문에 `*.md` 파일도 일반 스벨트킷 컴포넌트와 동일한 방법으로 불러올 수
있습니다.

이를 위해
[@testing-library/svelte](https://github.com/testing-library/svelte-testing-library)를
설치합니다.

```bash
npm i -D @testing-library/svelte
```

그런데 마크다운 문서를 테스트할 필요가 있을까요? 보통은 굳이 테스트할 필요가 없습니다. 다만 몇
가지 상황에서는 테스트가 유용할 수 있습니다.

- 일반 마크다운이 아니라 MDX 파일이라 문서 안에 컴포넌트가 담기거나 로직이 들어가는 경우
- 레이아웃 구조가 복잡한 경우

이 글에서는 레이아웃을 테스트하고자 합니다. 마크다운의 프론트메터frontmatter에 적혀있는
`title`과 `summary`가 제대로 렌더링되는지 확인하면 좋겠습니다.

모든 문서에 중복된 테스트를 만들 필요는 없으니 하나의 문서에 대한 테스트만 만들면 좋겠습니다.
다음은 `/routes/posts/about/+page.md` 파일의 앞 부분입니다.

```markdown
---
title: 소개
publishedAt: '2022-03-31'
summary: 블로그 소개
---

공부하고 정리하는 블로그입니다. 주로 프로그래밍 이야기를 합니다.
```

이 문서를 렌더링하면 다음과 같이 되어야 합니다.

- `<head>`의 `<title>`에 제목이 담겨야 합니다.
- `<head>`의 <meta name="description">에 요약이 담겨야 합니다.
- 문서의 제목이 `<h1>`에 담겨야 합니다.

아래와 같이 `/routes/posts/about/test.ts` 파일을 만들면 이 테스트를 수행할 수 있습니다.

```typescript
import { cleanup } from '@testing-library/svelte'
import { beforeEach, expect, test } from 'vitest'

import { getQueryAPI } from '$lib/utils'

// @ts-ignore: *.md is not supported by typescript
import About from './+page.md'

beforeEach(cleanup)

test('Metadata rendering', () => {
  const $ = getQueryAPI(About)
  expect($('title')?.textContent).toBe('소개 :: 공부왕 김공부')
  expect($('meta[name="description"]')?.getAttribute('content')).toBe('블로그 소개')
  expect($('h1')?.textContent).toBe('소개')
})
```

다음은 마크다운 문서 또는 스벨트 컴포넌트에 대한 테스트를 도와주는 작은 유틸리티입니다.
`src/lib/utils.ts` 라는 이름으로 저장하세요.

```typescript
import { render } from '@testing-library/svelte'
import type { SvelteComponent } from 'svelte'

export const getQueryAPI = (c: typeof SvelteComponent) => {
  const doc = render(c).container.ownerDocument
  return (selector: string) => doc.querySelector(selector)
}
```

마지막으로, `vitest`는 기본적으로 `*.test.ts` 형식의 파일을 테스트로 인식하는데, 우리가
만든 테스트 파일은 `test.ts`이므로 이 형식에 부합하지 않습니다. 따라서 `vite.config.js`
파일을 수정하여 `test.ts` 형식도 인식하게 해줍니다.

```js
// ...중략
const config = {
  // ...중략
  test: {
    // ...중략
    include: [
      // 기본 패턴
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // 추가된 패턴
      '**/{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
}
// ...후략
```

## 스벨트 컴포넌트 단위 테스트

마크다운 문서의 단위 테스트와 동일하므로 설명을 생략합니다. 테스트 코드 예시가 필요하신 분은
[Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)를
참고해주세요.

## 마치며

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요.

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
