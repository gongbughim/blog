<script lang="ts">
  import { onMount } from 'svelte'

  import * as wasm from '$lib/blogwasm'

  onMount(async () => {
    await wasm.default()
    wasm.greet('WASM')
  })
</script>
