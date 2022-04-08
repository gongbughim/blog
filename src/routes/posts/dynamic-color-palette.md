---
title: 동적 컬러 팔레트
publishedAt: '2022-04-08'
summary: 블로그 색상 팔레트를 동적으로 바꾸기
---

이 블로그는 페이지가 바뀌거나 새로고침을 하면 색상 팔레트가 바뀝니다. CSS 변수와 자바스크립트를
적당히 섞어서 구현한 기능인데요, 구현 과정을 정리해 보았습니다.

## HSL 색상 표현과 CSS 변수

표준 브라우저들은 모두 HSL 또는 HSLA 색상 표현을 지원하기 때문에 아래와 같은 CSS를 쓸 수
있습니다.

```css
:root {
  /* 색조hue 채도saturation 명도lightness / 알파alphaa */
  color: hsl(0 100% 50% / 100%);
}
```

한편, 표준 브라우저는 CSS 변수도 잘 지원하기 때문에 아래와 같이 색조 채널만 변수로 분리할 수도
있습니다.

```css
:root {
  --hue: 0;
  color: hsl(--var(--hue) 100% 50% / 100%);
}
```

게다가 `calc()` 표현식을 쓰면 간단한 사칙연산을 할 수 있으므로 아래와 같이 색조 채널을 적당히
돌려서 파생된 색상을 만들 수 있습니다. 180도 돌리면 보색이 나옵니다.

```css
:root {
  --hue: 0;
  --hue2: calc(var(--hue) + 180);
  color: hsl(--var(--hue) 100% 50% / 100%);
  background-color: hsl(--var(--hue2) 20% 80% / 100%);
}
```

## 색상 팔레트 만들기

위 특성을 이용해서 아래와 같이 블로그에서 사용할 색상 팔레트를 만들었습니다.

```css
:root {
  --c-primary-hue: 0;
  --c-secondary-hue: calc(var(--c-primary-hue) + 120);
  --c-tertiary-hue: calc(var(--c-primary-hue) + 240);
  --c-accent: hsl(var(--c-secondary-hue) 60% 40% / 100%);
  --c-accent-bg0: hsl(var(--c-tertiary-hue) 40% 80%);
  --c-accent-bg1: hsl(var(--c-tertiary-hue) 40% 70%);
  --c-fg: hsl(var(--c-primary-hue) 5% 35% / 100%);
  --c-bg: hsl(var(--c-primary-hue) 10% 95% / 100%);
```

기본 색조인 `--c-primary-hue`를 설정하고, 여기에서 120도, 240도를 돌려서 2차색을
위한 색조를 얻어내서 이를 각각 `--c-secondary-hue`와 `--c-tertiary-hue`로 지정합니다.

원래 미술시간에 배운 예쁜 색상환(빨노파 색상환)에서는 이렇게 하면 잘 어울리는 세 가지 색상이
뽑히는데, HSL의 색상환(빨녹파 색상환)에서는 조금 덜 예쁜 색상이 뽑혀서 아쉽습니다. 다음에
시간이 나면 예쁜 색상환을 구현해보려고 합니다.

아무튼, 이렇게 뽑은 세 가지 색에서 채도와 명도를 조정하여 강조색, 강조색 배경1, 강조색 배경2,
글자색, 배경색 등을 만들어냈습니다.

이제 기본 색조만 바꿔주면 나머지 색상들이 적당히 어울리는 색상으로 바뀌게 되었습니다.

## 자바스크립트를 이용하여 색상을 랜덤하게 바꾸기

SCSS 류의 전처리기와 달리 표준 CSS의 변수를 이용하면 변수의 값을 동적으로 바꿀 때 나머지
연관된 값들이 연쇄적으로 알아서 바뀌기 때문에 아주 좋습니다. 예를 들어 아래와 같이 특정 요소에
인라인 스타일로 변수값을 덮어쓰면 이 요소에서는 나머지 변수들도 다 값이 바뀌게 됩니다.

```html
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

## 부드럽게 바뀌는 효과 넣기

CSS의 `transition`을 이용하면 색상이 부드럽게 전환되도록 할 수 있습니다.

```css
* {
  box-sizing: border-box;
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

재미있었어요 :)
