---
title: 스벨트킷+WASM
publishedAt: '2022-04-03'
summary: 스벨트킷에서 러스트로 만든 WASM 코드를 실행하는 방법
---

최신 브라우저들이 모두 웹어셈블리를 지원하기 때문에 전체 코드 중 성능이 특히 중요한 부분들을
웹어셈블리로 대체하는 사이트가 점차 늘고 있습니다. 이 글에서는 러스트로 간단한 웹어셈블리
코드를 만들고 이를 스벨트킷 사이트에서 호출하는 방법을 설명합니다.

## 웹어셈블리란

[웹어셈블리WemAssembly](https://webassembly.org/)란 빠르게 전송할 수 있고 웹
브라우저에서 거의 네이티브 코드의 속도로 실행할 수 있는 작은 바이너리 파일입니다. 현대의 웹
브라우저들은 모두 웹어셈블리를 실행할 수 있는 가상 머신을 내장하고 있습니다.

자바스크립트가 초기에는 웹 브라우저에서만 실행되다가 요즘에는 NodeJS나 Deno 덕에 서버에서도
실행되는 것과 마찬가지로, 웹어셈블리도 처음에는 웹 브라우저에서만 실행이 됐으나 요즘에는
어디에서든 실행할 수 있도록 점차 확장되고 있습니다.

작고 빠르고 안전하며 다양한 언어로 작성할 수 있고 어디에서나 실행할 수 있기 때문에 점차 그
역할이 커지고 있습니다.

## 러스트로 웹어셈블리 파일 만들기

웹어셈블리는 다양한 언어로 만들 수 있지만, 웹어셈블리를 만들 때 가장 인기있는 언어는
러스트입니다. 러스트는 컴파일러 및 각종 툴체인이 훌륭해서 개발 경험이 좋고 만들어진 WASM
파일의 크기도 매우 작은 편이라서 그렇습니다.

러스트로 웹어셈블리를 만들고 스벨트킷에서 호출하는 순서는 이렇습니다.

1. 러스트 프로젝트 셋업
2. 코드 작성
3. 웹어셈블리 빌드
4. 스벨트킷에서 임포트하여 호출

이 블로그는 CloudFlare Pages를 이용해서 빌드를 하고 있는데 아쉽게도 이 환경은 아직 러스트를
지원하지 않습니다. 따라서 웹어셈블리를 빌드하는 과정은 별도의 환경에서 진행하고, 빌드한
결과물만 가져와서 쓰는 방식으로 해야합니다.

웹어셈블리 프로젝트를 별도의 저장소로 만들어서 깃헙에 올리고 깃헙 액션즈Github Actions로
빌드를 하고, 기존의 블로그 프로젝트에서는 이 빌드 결과를 가져와서 쓰는 방식으로 분리를 하면
될 것 같습니다.

러스트 공식 웹사이트의 [안내](https://www.rust-lang.org/tools/install)에 따라 러스트를
설치하세요. 그 다음 [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)을
설치합니다. 이제 준비가 끝났습니다.

블로그 프로젝트의 상위 디렉터리(예를 들어 블로그 프로젝트가 `~/prjs/blog`라면 `~/prjs`)에서
다음 명령을 실행하면 `blogwasm` 디렉터리에 러스트 라이브러리 프로젝트가 만들어집니다.
`cargo new` 명령은 `npm init`과 유사한 역할을 합니다.

```bash
cargo new --lib blogwasm
```

이 디렉터리로 이동한 뒤에 웹어셈블리 개발에 필요한 크레이트(crate: 러스트에서는 패키지를
크레이트라고 부릅니다)를 설치합니다. `cargo add` 명령은 `npm install`과 유사한 역할을
합니다.

```bash
cargo add wasm-bindgen
```

위 명령을 실행하고 나면 `Cargo.toml` 파일과 `Cargo.lock` 파일에 관련 내용이 추가됩니다.
이 파일들은 노드JS의 `package.json` 파일 및 `package-lock.json` 파일과 유사한 역할을
합니다.

`src/lib.rs` 파일의 내용을 아래와 같이 수정합니다. 아래 코드는
[The Rust Wasm Book](https://rustwasm.github.io/book/game-of-life/hello-world.html)에서
참고하였습니다.

```rust
// 자바스크립트의 import와 유사
use wasm_bindgen::prelude::*;

// 메모리 할당에 wee_alloc을 사용
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// 자바스크립트의 alert()을 러스트에서 호출하기 위해 필요
#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
}

// 자바스크립트에서 호출할 수 있는 greet() 함수
#[wasm_bindgen]
pub fn greet(name: &str) {
  alert(&format!("Hello, {}!", name));
}
```

마지막으로, `Cargo.toml` 파일에 아래 내용을 추가해주세요. `cdylib` 타입은 원래 컴파일된
라이브러리를 C 또는 C++에 링크하기 위해 사용하는데(C Dynamic Library의 약자인 것 같아요),
웹어셈블리 개발에도 쓰입니다.

```toml
[lib]
crate-type = ["cdylib"]
```

다음 명령을 실행하면 `pkg` 디렉터리 안에 웹어셈블리 파일이 만들어집니다.

```bash
wasm-pack build --target web
```

## 스벨트킷에서 호출하기

잘 작동하는지 확인을 해보기 위해 임시로 `pkg` 디렉터리를 복사하여 블로그 프로젝트의
`src/lib/blogwasm` 디렉터리에 넣습니다.

이제 아무 스벨트 파일에서나 이 라이브러리를 호출할 수 있습니다. 예를 들어
`src/routes/test.svelte` 파일을 만들고 아래 내용을 추가해보세요.

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import * as wasm from '$lib/blogwasm'

  onMount(async () => {
    await wasm.default()
    wasm.greet('WASM')
  })
</script>
```

`npm run dev` 명령으로 개발 서버를 실행하고 `http://localhost:3000/test` 주소에
접속하면 "Hello WASM"이라는 얼럿창이 뜨는 것을 확인할 수 있습니다.

## 자동 배포

러스트 프로젝트에서 컴파일을 하고 디렉터리를 수동으로 복사하는 작업을 매번 반복하기엔 귀찮기도
하고 느릴 뿐 아니라 실수를 유발하기도 합니다.

`npm install` 명령은 임의의 URL에 있는 `*.tar.gz` 파일을 설치할 수 있습니다. 따라서
`blogwasm` 프로젝트의 빌드 결과물을 `blogwasm.tar.gz` 파일로 압축하여 인터넷에 올려두는
작업을 자동화하면 문제가 해결됩니다.

npm 레지스트리에 등록하는 방법도 있기는 하지만 개인이 쓰는 패키지를 올리기엔 적절치 않습니다.
이런 상황에서 Github Releases 기능을 활용하면 좋습니다.

`blogwasm` 프로젝트에 `.github/workflows/release.yml` 파일을 추가합니다.

```yaml
name: release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Prepare build
        uses: jetli/wasm-pack-action@v0.3.0
        with:
          version: 'latest'
      - name: Build
        run: wasm-pack build --target web && tar -czvf blogwasm.tar.gz pkg/
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: blogwasm.tar.gz
```

이제 버전 태깅을 한 후에 푸시하면 자동으로 빌드가 실행되고 그 결과가 `blogwasm.tar.gz`
이라는 파일에 담겨 릴리즈됩니다.

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

잠시 기다리면 결과물이 릴리즈된 것을 확인할 수 있습니다. 참고로 제 깃헙 저장소의 경우
https://github.com/gongbughim/blogwasm/releases 에서 릴리즈된 결과들을 확인할 수
있습니다.

이제 `blog` 프로젝트에서 이 파일을 사용하도록 설정합니다.

```bash
npm i -D https://github.com/gongbughim/blogwasm/releases/download/v0.1.2/blogwasm.tar.gz
```

다음으로, 기존 `src/routes/test.svelte` 파일의 임포트 부분을 `$lib/blogwasm` 대신
`blogwasm`으로 수정합니다.

```svelte
<script lang="ts">
  import * as wasm from 'blogwasm'
</script>
```

원래는 이러면 되어야 하는데, 현재(2022-04-03 기준) vite에 버그가 있어서 아쉽게도 이 부분에서
오류가 발생합니다. 임시로 `node_modules/blogwasm` 파일을 `src/lib/blogwasm`으로
복사해주면 문제가 해결됩니다.

이 과정 역시 수작업으로 하면 실수의 여지가 있으니 자동화하면 좋습니다. `package.json`에
`postinstall` 스크립트를 추가해줍니다.

```json
{
  "scripts": {
    "postinstall": "cp -r ./node_modules/blogwasm ./src/lib/blogwasm",
    "...": "..."
  }
}
```

외부에서 복사한 파일들이 깃에 커밋되면 안되니까 `.gitignore` 파일에 다음 한 줄을
추가해줍니다.

```
src/lib/blogwasm/
```

이제 수정했던 임포트 경로만 다시 원래대로 되돌려주면 문제없이 잘 작동합니다.

```svelte
<script lang="ts">
  import * as wasm from '$lib/blogwasm'
</script>
```

## 언제 WASM을 쓰나

여러 성능 테스트를 살펴보면, WASM을 쓴다고 해서 항상 속도가 더 빨라지지는 않습니다. WASM을
쓰기에 가장 이상적인 상황은 이렇습니다.

- 호출을 하면 WASM 안에서 많은 연산을 수행하는 상황
- WASM과 JS 코드 사이의 교류가 적은 상황

## 마치며

이 글에서 설명한 코드는 이 블로그에도 적용되어 있습니다.
[소스 코드](https://github.com/gongbughim/blog)가 공개되어 있으니 참고해주세요. 웹
어셈블리 프로젝트는 [별도의 저장소](https://github.com/gongbughim/blogwasm)
공개했습니다.

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
