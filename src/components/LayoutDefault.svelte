<script>
  export let title = ''
  export let summary = ''
  export let publishedAt = ''
</script>

<svelte:head>
  <title>{title}</title>
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
