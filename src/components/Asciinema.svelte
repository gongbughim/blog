<script lang="ts">
  import { onMount } from 'svelte'

  export let id: string
  export let startAt = 0
  export let autoplay = false
  export let loop = false
  export let speed = 1
  export let idleTimeLimit = 2
  export let rows: number | null = null
  export let cols: number | null = null

  let el: HTMLDivElement

  onMount(() => {
    const script = el.ownerDocument.createElement('script')

    script.setAttribute('src', `https://asciinema.org/a/${id}.js`)
    script.setAttribute('id', `asciicast-${id}`)
    script.setAttribute('async', 'async')

    script.dataset.startAt = `${startAt}`
    script.dataset.autoplay = `${autoplay}`
    script.dataset.loop = `${loop}`
    script.dataset.speed = `${speed}`
    script.dataset.idleTimeLimit = `${idleTimeLimit}`
    if (rows !== null) script.dataset.rows = `${rows}`
    if (cols !== null) script.dataset.cols = `${cols}`
    script.dataset.theme = 'tango'

    el.appendChild(script)
  })
</script>

<div bind:this={el} class="frame" />
