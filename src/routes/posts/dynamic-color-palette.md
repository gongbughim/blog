---
title: 동적 컬러 팔레트
publishedAt: '2022-04-08'
summary: 블로그 색상 팔레트를 동적으로 바꾸기
---

이 블로그는 페이지가 바뀌거나 새로고침을 하면 색상 팔레트가 바뀝니다. CSS 변수와 자바스크립트를
적당히 섞어서 구현한 기능인데요, 구현 과정을 정리해 보았습니다.

## LCH 색상 표현과 CSS 변수

[CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)는 LCH 색상 표현을
지원합니다. 그래서 아래와 같은 CSS를 쓸 수 있습니다.

```css
:root {
  /* 밝기lightness 채도chroma 색조hue */
  color: lch(50% 30 0);
}
```

그리고 표준 브라우저는 CSS 변수도 잘 지원하기 때문에 아래와 같이 색조 채널만 변수로 분리할
수도 있습니다.

```css
:root {
  --hue: 0;
  color: lch(50% 30 --var(--hue));
}
```

또한 `calc()` 표현식을 쓰면 간단한 사칙연산을 할 수 있으므로 아래와 같이 색조 채널을 적당히
돌려서 파생된 색상을 만들 수 있습니다. 180도 돌리면 보색이 나옵니다.

```css
:root {
  --hue: 0;
  --hue2: calc(var(--hue) + 180);
  --c-fg: lch(35% 10 var(--hue));
  --c-bg: lch(95% 5 var(--hue2));
}
```

## 색상 팔레트 만들기

위 특성을 이용해서 아래와 같이 블로그에서 사용할 색상 팔레트를 만들었습니다.

```css
:root {
  --c-primary-hue: 0;
  --c-secondary-hue: calc(var(--c-primary-hue) + 120);
  --c-tertiary-hue: calc(var(--c-primary-hue) + 240);
  --c-accent: lch(50% 90 var(--c-secondary-hue));
  --c-accent-bg0: lch(80% 20 var(--c-tertiary-hue));
  --c-accent-bg1: lch(80% 20 var(--c-tertiary-hue));
  --c-fg: lch(40% 20 var(--c-primary-hue));
  --c-bg: lch(98% 5 var(--c-primary-hue));
}
```

기본 색조인 `--c-primary-hue`를 설정하고, 여기에서 120도, 240도를 돌려서 2차색을
위한 색조를 얻어내서 이를 각각 `--c-secondary-hue`와 `--c-tertiary-hue`로 지정합니다.

이렇게 뽑은 세 가지 색에서 밝기와 채도를 조정하여 강조색, 강조색 배경1, 강조색 배경2, 글자색,
배경색 등을 만들어냈습니다.

이제 기본 색조만 바꿔주면 나머지 색상들이 적당히 어울리는 색상으로 바뀌게 되었습니다.

## 자바스크립트를 이용하여 색상을 랜덤하게 바꾸기

SCSS 류의 전처리기와 달리, 표준 CSS의 변수를 이용하면 변수의 값을 동적으로 바꿀 때 나머지
연관된 값들이 연쇄적으로 알아서 바뀌기 때문에 아주 좋습니다. 예를 들어 아래와 같이 특정 요소에
인라인 스타일로 변수값을 덮어쓰면 이 요소에서는 나머지 변수들도 다 값이 바뀌게 됩니다.

```svelte
<div style="--c-primary-hue: 200;">...</div>
```

이 특성을 이용해서 레이아웃 컴포넌트에 아래와 같은 코드를 넣었습니다.

```typescript
import { afterNavigate } from '$app/navigation'
import conf from '$lib/conf'

let hueDegree = 0
let el: HTMLElement | null = null

afterNavigate(() => (hueDegree = Math.random() * 360))

$: if (el) {
  const html = el.ownerDocument!.firstElementChild as HTMLElement
  html.style.setProperty('--c-primary-hue', `${hueDegree | 0}`)
}
```

스벨트킷의 `afterNavigate` 라이프사이클 이벤트를 이용해서 페이지가 바뀌면 `html` 요소에
인라인 스타일로 `--c-primary-hue`를 랜덤 값으로 지정하게 해주었습니다.

자바스크립트가 작동하지 않는 환경에서도 기본 색조가 CSS에 명시되어 있기 때문에 사이트 이용에
지장이 없어서 좋습니다.

## 부드럽게 바뀌는 효과 넣기

CSS의 `transition`을 이용하면 색상이 부드럽게 전환되도록 할 수 있습니다.

```css
* {
  transition-duration: 0.5s;
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: ease-out;
}
```

하지만 모션을 원하지 않는 사용자들이 있을 수 있으므로 아래와 같이 미디어쿼리를 추가해주었습니다.

```css
@media (prefers-reduced-motion) {
  * {
    transition-property: none;
  }
}
```

## LCH 색상을 지원하지 않는 브라우저

`lab()` 이나 `lch()`는 2022년 4월 기준으로 아직은 사파리에서만 지원을 합니다. 따라서
아래와 같이 `@support` 미디어쿼리를 이용해서 `lch()`를 지원하지 않는 브라우저에서는 대안으로
`hsl()`을 사용하게 했습니다.

```css
@supports not (color: lch(0% 0 0 / 0.5)) {
  :root {
    --c-accent: hsl(var(--c-secondary-hue) 60% 40% / 100%);
    --c-accent-bg0: hsl(var(--c-tertiary-hue) 40% 80%);
    --c-accent-bg1: hsl(var(--c-tertiary-hue) 40% 70%);
    --c-fg: hsl(var(--c-primary-hue) 5% 35% / 100%);
    --c-bg: hsl(var(--c-primary-hue) 10% 95% / 100%);
  }
}
```

LAB 또는 LCH와 달리 RGB 또는 HSL 색공간은 **지각적 균일성perceptual uniformity**이
보장되지 않기 때문에 접근성 측면에서 문제가 있을 수 있습니다. 특히 랜덤하게 선택된 색조가
무엇인지에 따라 글자색-배경색 간 거리가 늘거나 줄 여지가 있습니다.

심미적인 문제도 있는데, HSL의 색조에서 원하는 보색 또는 3차색을 찾아내는 것도 쉽지가 않기
때문에 만들어진 색상들이 때론 어색하기도 합니다.

[PostCSS Lab Function](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-lab-function)
같은 전처리기를 쓰면 모든 브라우저에서 LCH를 쓸 수는 있으나 그렇게 하면 위 예시에서처럼 CSS
변수를 동적으로 사용할 수 없다는 단점이 생깁니다.

[d3](https://d3js.org)나 c[olor-math](https://www.npmjs.com/package/color-math)
등을 활용하여 모든 색 연산을 자바스크립트로 구현해도 되겠지만 이런 접근을 선호하지는 않습니다.

그런 이유로 당분간은 나머지 브라우저에서는 `hsl()`을 쓰도록 놔두려고 해요. 심미적인 면은
여전히 좀 별로지만, 접근성에는 문제가 생기지 않도록 값들을 잘 조절했습니다.
