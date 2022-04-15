---
title: Svelte Cubed 기반의 3D 그래픽스
publishedAt: '2022-04-11'
summary: Svelte Cubed 라이브러리를 이용해서 3D 그래픽스 쉽게 하기
---

<script>
  import { onMount } from 'svelte'
  import SvelteCubedExample from '$components/SvelteCubedExample.svelte'
  import SvelteCubedExample2 from '$components/SvelteCubedExample2.svelte'

  $: reduceMotion = true

  let mq

  const updateReduceMotionFlag = () => reduceMotion = !mq || mq.matches

  onMount(() => {
    mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    updateReduceMotionFlag()
    mq.addEventListener('change', updateReduceMotionFlag)
    return () => mq.removeEventListener('change', updateReduceMotionFlag)
  })
</script>

[Svelte Cubed](https://svelte-cubed.vercel.app/)는 스벨트를 개발한 리치 해리스가
얼마 전에 공개한 라이브러리로, 스벨트 및 스벨트킷에서 [three.js](https://threejs.org/)를
쉽게 쓸 수 있도록 도와주는 간단한 래퍼wrapper입니다.

다음은 [Getting Started](https://svelte-cubed.vercel.app/docs/getting-started)의
예시를 따라서 만들어본 컴포넌트입니다.

<SvelteCubedExample autoRotate={!reduceMotion} />

마우스나 터치로 카메라를 회전시킬 수 있고, 좌측 상단의 컨트롤을 이용해서 육면체의 모양을 바꿀
수 있습니다.

## three.js

three.js는 웹 브라우저에서 GPU 기반 3D 그래픽스를 쉽게 구현할 수 있도록 도와주는
라이브러리입니다. WebGL 프로그래밍을 직접하는 것에 비해 정말 편리하지만 아주 간단한 작업을
하기에는 작성할 코드의 양이 많게 느껴지기도 합니다.

## Svelte Cubed

스벨트 큐브드는 스벨트를 개발한 리치 해리스가
[2021년 12월에 공개](https://www.youtube.com/watch?v=qD6Pmp45sO4)한 작은
라이브러리입니다. 스벨트 또는 스벨트킷에서 선언적인 코드로 three.js를 쓸 수 있게 도와줍니다.

예를 들어 Svelte Cubed를 설치한 후 아래 코드를 작성하면 검은 배경에 정육면체가 그려집니다.

```svelte
<script>
  import * as THREE from 'three'
  import * as SC from 'svelte-cubed'
</script>

<SC.Canvas>
  <SC.Mesh geometry={new THREE.BoxGeometry()} />
  <SC.PerspectiveCamera position={[1, 1, 3]} />
</SC.Canvas>
```

동일한 코드를 `three.js`로 쓰면 다음과 같습니다.

```js
import * as THREE from 'three'

function render(element) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    45,
    element.clientWidth / element.clientHeight,
    0.1,
    2000,
  )

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(element.clientWidth / element.clientHeight)
  element.appendChild(renderer.domElement)

  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshNormalMaterial()
  const box = new THREE.Mesh(geometry, material)
  scene.add(box)

  camera.position.x = 2
  camera.position.y = 2
  camera.position.z = 5

  camera.lookAt(new THREE.Vector3(0, 0, 0))

  renderer.render(scene, camera)
}
```

특히 스벨트는 가상돔Virtual DOM을 사용하지 않기 때문에 거의 아무런 오버헤드 없이 애니메이션
또는 인터랙션을 자연스럽게 추가할 수 있어서 좋습니다.

## 설치하기

스벨트킷 프로젝트에서 스벨트 큐브드는 설치하기는 아주 쉽습니다.

```bash
npm i three svelte-cubed
```

타입스크립트를 사용한다면 `threejs`에 대한 타입 정의를 별도로 설치하면 좋습니다.

```bash
npm i -D @types/three
```

## 블로그에 연결하기

[Getting Started](https://svelte-cubed.vercel.app/docs/getting-started)의 예시를
따라서 컴포넌트를 만들고 블로그에 맞춰 조금 수정했는데요, 어떤 부분을 어떻게 수정했는지
정리했습니다.

다음은 전체 코드입니다. 저는 `/src/components/SvelteCubedExample.svelte` 파일을
만들었습니다.

```svelte
<script>
  import * as SC from 'svelte-cubed'
  import * as THREE from 'three'

  export let autoRotate = false

  let width = 1
  let height = 1
  let depth = 1

  let spin = 0

  SC.onFrame(() => {
    if (autoRotate) spin += 0.01
  })
</script>

<div class="root">
  <SC.Canvas
    antialias
    background={new THREE.Color('papayawhip')}
    fog={new THREE.FogExp2('papayawhip', 0.1)}
    shadows
  >
    <SC.Group position={[0, -height / 2, 0]}>
      <SC.Mesh
        geometry={new THREE.PlaneGeometry(50, 50)}
        material={new THREE.MeshStandardMaterial({ color: 'burlywood' })}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
      <SC.Primitive
        object={new THREE.GridHelper(50, 50, 'papayawhip', 'papayawhip')}
        position={[0, 0.001, 0]}
      />
    </SC.Group>

    <SC.Mesh
      geometry={new THREE.BoxGeometry()}
      material={new THREE.MeshStandardMaterial({ color: 0xff3e00 })}
      scale={[width, height, depth]}
      rotation={[0, spin, 0]}
      castShadow
    />

    <SC.PerspectiveCamera position={[1, 1, 3]} />
    <SC.OrbitControls enableZoom={false} maxPolarAngle={Math.PI * 0.51} />
    <SC.AmbientLight intensity={0.6} />
    <SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} shadow={{ mapSize: [2048, 2048] }} />
  </SC.Canvas>

  <div class="controls">
    <label><input type="range" bind:value={width} min={0.1} max={3} step={0.1} /> width</label>
    <label><input type="range" bind:value={height} min={0.1} max={3} step={0.1} /> height</label>
    <label><input type="range" bind:value={depth} min={0.1} max={3} step={0.1} /> depth</label>
  </div>
</div>

<style>
  .root {
    position: relative;
    width: 100%;
    border: 1px solid #000;
    aspect-ratio: 2 /1;
  }

  .controls {
    position: absolute;
    top: 1em;
    left: 1em;
  }

  label {
    display: flex;
    width: 60px;
    align-items: center;
    gap: 0.5em;
  }

  input {
    width: 80px;
    margin: 0;
  }
</style>
```

`<SC.Canvas>` 요소는 `<div>` 컨테이너를 생성하고 그 안에 `<canvas>`를 만드는데,
컨테이너의 CSS에 `position: absolute`가 설정되어 있습니다. 따라서 컴포넌트 전체를 `<div>`
안에 담고 해당 요소의 CSS에 `position: relative`를 추가했습니다.

```svelte
<div class="root">
  <SC.Canvas>...</SC.Canvas>
</div>

<style>
  .root {
    position: relative;
    width: 100%;
    border: 1px solid #000;
    aspect-ratio: 2 / 1;
  }
</style>
```

원래 코드에서는 애니메이션이 얼마나 쉽게 구현되는지 설명하기 위한 목적으로 육면체가 자동으로
회전하도록 되어 있습니다. 다만 이렇게 하면 '움직임 줄이기' 옵션을 켠 사람들에게 접근성 문제를
야기할 수 있습니다.

이 문제를 해결하기 위해 우선 자동 회전을 켜고 끌 수 있는 속성을 추가했습니다.

```svelte
<script>
  export let autoRotate = false

  SC.onFrame(() => {
    if (autoRotate) spin += 0.01
  })
</script>
```

그 다음으로는, 마크다운 파일에 아래 코드를 추가해서 '움직임 줄이기' 옵션이 켜져 있는지
감지하도록 했습니다.

```js
import { onMount } from 'svelte'

$: reduceMotion = true

let mq

const updateReduceMotionFlag = () => (reduceMotion = !mq || mq.matches)

onMount(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateReduceMotionFlag()
  mq.addEventListener('change', updateReduceMotionFlag)
  return () => mq.removeEventListener('change', updateReduceMotionFlag)
})
```

이제 아래와 같이 `reduceMotion` 플래그의 값을 컴포넌트에 전달할 수 있게 됐습니다.

```svelte
<SvelteCubedExample autoRotate={!reduceMotion} />
```

## 모델 로딩하기

아직 문서는 없지만 Svlete Cubed의 소스코드를 읽어보면 `<SC.Primitive>` 요소를 활용해서
원하는 모델을 렌더링할 수 있습니다.

<SvelteCubedExample2 autoRotate={!reduceMotion} />

`static` 디렉토리에 임의의 모델 파일을 넣고 아래와 같이 모델 로더로 불러올 수 있습니다. 저는
`*.glb` 파일을 읽어오기 위해 `GLTFLoader`를 사용했습니다.

```svelte
<script lang="ts">
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

  let model: THREE.Group

  onMount(async () => {
    model = (await new GLTFLoader().loadAsync('../robot.glb')).scene
  })
</script>

<SC.Canvas>
  {#if model}
    <SC.Primitive object={model} scale={[width, height, depth]} rotation={[0, spin, 0]} />
  {/if}
</SC.Canvas>
```

아직 `<SC.Primity>` 컴포넌트는 그림자를 지원하지 않는데요, 이
[PR](https://github.com/Rich-Harris/svelte-cubed/pull/41)을 참고하여 쉽게 해결할 수
있습니다.

## 번들 사이즈

`npm run build` 명령으로 정적 사이트를 생성했을 때 이 문서의 번들 크기는 약 608 KiB
입니다(압축을 하면 148.19 KiB). 다른 평균적인 사이트와 비교해서 너무 크다고 할 수는 없지만
그렇다고 가벼운 것도 아닙니다.

그래도 다행스러운 점은 스벨트킷이 각 페이지별로 번들링을 해주기 때문에 `threejs`에 의존성이
없는 일반 페이지들은 여전히 작은 크기가 유지된다는 점입니다.

## 소스코드

- 블로그 전체 [소스코드](https://github.com/gongbughim/blog)

## 관련 글

- [스벨트킷으로 블로그 만들기](/posts/sveltekit-blog)
