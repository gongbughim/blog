---
title: 스벨트킷 mdsvex 프리페치 설정하기
publishedAt: '2022-04-02'
modifiedAt: '2022-12-17'
summary: 스벨트킷과 mdsvex 조합에서 프리페치(sveltekit:prefetch) 설정하는 방법
---

아래 내용은
[1.0.0-next.454](https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%401.0.0-next.454)
이전 버전에 해당합니다. `1.0.0-next.454` 이후 버전에서 프리페치를 적용하려면 아래 내용을
모두 무시하고 `body` 태그에 `data-sveltekit-preload-data="hover"` 속성을 넣어주기만 하면 됩니다.

---

스벨트킷과 mdsvex 조합에서 프리페치(sveltekit:prefetch) 설정하는 방법을 설명합니다.

## 프리페치란

프리페치prefetch는 사용자가 링크 위에 마우스를 올리거나 모바일 기기에서 링크를 터치하는 순간
해당 페이지를 렌더링하기 위해 필요한 데이터를 미리 받아오는 걸 말합니다. 프리페치를 설정하면
링크를 클릭하자마자 사용자가 체감하는 페이지 로딩 지연이 거의 사라집니다.

스벨트킷에서는 내부링크에 대해 `sveltekit:prefetch` 속성을 넣어주면 클라이언트 측 프리페치가
작동하게 됩니다.

```svelte
<a href="/some-link" svelte:prefetch>Some link</a>
```

자세한 내용은 스벨트킷 공식 문서의
[해당 섹션](https://kit.svelte.dev/docs/a-options#sveltekit-prefetch)을 참고하세요.

## mdsvex 패키지

스벨트킷에서 MDX를 사용하려면 보통 [mdsvex 패키지](https://mdsvex.pngwn.io/)를 씁니다.

하지만 mdsvex 패키지로 렌더링된 페이지의 경우 링크에 `svelte:prefetch`가 설정되지 않는다는
단점이 있습니다.

```markdown
[Some link](/some-link)
```

다행히 mdsvex는 내부에서 [rehype 패키지](https://github.com/rehypejs/rehype)를
사용하기 때문에 rehype 플러그인을 작성하면 렌더링 결과를 원하는대로 바꿀 수 있습니다.

## 플러그인 만들기

플러그인 제작을 위해 필요한 라이브러리를 추가합니다.

```bash
npm i -D unist-util-visit
```

그 다음, mdsvex 설정의 rehypePlugins 변수에 플러그인을 추가했습니다.

```js
import { visit } from 'unist-util-visit'

// ...
;() => {
  // Attach "sveltekit:prefetch" to internal links
  return tree => {
    const pInnerLink = /^(\/|\.)/
    visit(tree, 'element', node => {
      if (node.tagName !== 'a') return
      if (!node.properties.href.match(pInnerLink)) return
      node.properties['sveltekit:prefetch'] = 'sveltekit:prefetch'
    })
  }
}
```

마크다운에서 렌더링된 HTML의 모든 엘리먼트 노드를 방문(`visit()`)하며 태그 이름이 `a`이면서
`href`에 적힌 주소가 블로그 내부 링크인 경우 `sveltekit:prefetch` 속성을 추가하도록
했습니다. 내부 링크인지 확인하는 패턴이 약간 어설프지만(주소가 `/`으로 시작하거나 `.`으로
시작하는지만 검사), 당장 적용하기에는 큰 문제가 없어 보입니다.

이제 마크다운 파일의 링크에도 프리페치가 적용되었습니다.

## 마치며

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요.

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
