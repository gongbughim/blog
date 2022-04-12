<script lang="ts">
  import { onMount } from 'svelte'
  import * as SC from 'svelte-cubed'
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

  export let autoRotate = false

  let width = 0.2
  let height = 0.2
  let depth = 0.2

  let spin = 0
  let model: THREE.Group

  onMount(async () => {
    model = (await new GLTFLoader().loadAsync('../robot.glb')).scene
  })
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
    <SC.Group position={[0, 0, 0]}>
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

    {#if model}
      <SC.Primitive object={model} scale={[width, height, depth]} rotation={[0, spin, 0]} />
    {/if}

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
    aspect-ratio: 2 / 1;
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
