---
title: 다크모드 지원하기
publishedAt: '2022-04-16'
summary: 블로그에서 다크모드를 지원하도록 CSS를 수정하는 방법
---

CSS 변수와 LCH 및 HSL 색공간을 이용해서 다크모드를 쉽게 지원하는 방법을 정리했습니다.
[동적 컬러 팔레트](/posts/dynamic-color-palette)에서 이어지는 내용입니다.

## 미디어쿼리

사용자가 다크모드를 선호하는지 여부를 알아내는 미디어쿼리는 다음과 같습니다.

```css
@media (prefers-color-scheme: dark) {
  /* ... */
}
```

위 미디어쿼리 블럭 안에 다크모드에서 사용할 CSS를 적어주면 다크모드를 쉽게 지원할 수 있습니다.

## 변수 재정의

이 블로그는 [동적 컬러 팔레트](/posts/dynamic-color-palette)에서 설명한대로 CSS 변수를
활용하여 아래와 같이 색상 팔레트를 정의하고 있습니다.

```css
:root {
  --c-primary-hue: 0;
  --c-secondary-hue: calc(var(--c-primary-hue) + 120);
  --c-tertiary-hue: calc(var(--c-primary-hue) + 240);
  --c-accent: lch(50% 50 var(--c-secondary-hue));
  --c-accent-bg0: lch(90% 20 var(--c-tertiary-hue));
  --c-accent-bg1: lch(90% 20 var(--c-tertiary-hue));
  --c-fg: lch(40% 10 var(--c-primary-hue));
  --c-bg: lch(98% 5 var(--c-primary-hue));
}
```

`--c-primary-hue` 변수로 색조hue만 정해주면 나머지 색상들이 자동으로 생성됩니다. 특히
기본 색조와 어울리는 다른 색조들을 얻어내고, 명도와 채도를 바꿔주기 위해서 LCH 색공간을 쓰고
있기 때문에 다크모드를 쉽게 지원할 수 있습니다. 색조는 유지하면서 글자색의 명도와 배경색의
명도를 역전시키면 되기 때문입니다.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --c-accent: lch(50% 50 var(--c-secondary-hue));
    --c-accent-bg0: lch(10% 20 var(--c-tertiary-hue));
    --c-accent-bg1: lch(20% 20 var(--c-tertiary-hue));
    --c-fg: lch(60% 10 var(--c-primary-hue));
    --c-bg: lch(2% 5 var(--c-primary-hue));
  }
}
```

색조를 정의하는 변수들(`--c-primary-hue`, `--c-secondary-hue`, `--c-tertiary-hue`)은
그대로 두고, 색조로부터 명도와 채도를 조절하여 실제 색상을 만들어내는 변수들만 새로 정의를
했습니다. 명도(L), 밝기(C), 색조(H) 중 명도만 뒤집었습니다.

## LCH를 지원하지 않는 브라우저에 대한 처리

`lab()` 이나 `lch()`는 2022년 4월 기준으로 아직은 사파리에서만 지원을 합니다. 따라서
아래와 같이 `@support` 미디어쿼리를 이용해서 `lch()`를 지원하지 않는 브라우저에서는 대안으로
`hsl()`을 사용해야 합니다.

아래와 같이 `@support`와 `@media`를 중첩해서 쓰면 "lch를 지원하지 않으면서 다크모드를
선호하는 경우"에 대한 CSS를 정의할 수 있습니다.

```css
@supports not (color: lch(0% 0 0 / 0.5)) {
  /* LCH를 지원하지 않는 브라우저의 색상 팔레트 */
  :root {
    --c-accent: hsl(var(--c-secondary-hue) 60% 40% / 100%);
    --c-accent-bg0: hsl(var(--c-tertiary-hue) 40% 80%);
    --c-accent-bg1: hsl(var(--c-tertiary-hue) 40% 70%);
    --c-fg: hsl(var(--c-primary-hue) 5% 35% / 100%);
    --c-bg: hsl(var(--c-primary-hue) 10% 95% / 100%);
  }

  @media (prefers-color-scheme: dark) {
    /* LCH를 지원하지 않는 브라우저의 다크모드 색상 팔레트 */
    :root {
      --c-accent: hsl(var(--c-secondary-hue) 30% 60% / 100%);
      --c-accent-bg0: hsl(var(--c-tertiary-hue) 80% 15%);
      --c-accent-bg1: hsl(var(--c-tertiary-hue) 80% 20%);
      --c-fg: hsl(var(--c-primary-hue) 10% 70% / 100%);
      --c-bg: hsl(var(--c-primary-hue) 10% 5% / 100%);
    }
  }
}
```

`lch()`와 달리 `hsl()`은 기계적으로 명도만 뒤집었을 때 예쁜 색조합이 나오지 않기 때문에
눈으로 보면서 수치들을 미세하게 조정했습니다.

## 마치며

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요.

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
