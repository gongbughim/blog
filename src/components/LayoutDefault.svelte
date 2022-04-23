<script>
  import 'katex/dist/katex.css'

  import conf from '$lib/conf'
  import { renderDot } from '$lib/graphviz'

  export let title = ''
  export let summary = ''
  export let publishedAt = ''

  import { onMount } from 'svelte'

  onMount(async () => {
    const els = [...document.querySelectorAll('pre[class*="language-render-"]')]
    els.forEach(el => {
      const lang = el.classList[0].split('-')[2]
      renderDot(el, lang)
    })
  })
</script>

<svelte:head>
  <title>{title} :: {conf.title}</title>
  <meta name="description" content={summary} />
</svelte:head>

<article class="post">
  <h1>{title}</h1>
  <p class="info">
    <time>{publishedAt}</time>
  </p>
  <slot />
</article>

<style>
  .info {
    margin: 1em 0 6em;
  }
</style>
