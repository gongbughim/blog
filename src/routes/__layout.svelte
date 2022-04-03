<script lang="ts">
  import '$lib/css/root.css'

  import conf from '$lib/conf'
</script>

<svelte:head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
  <!-- Google Tag Manager -->
  <script>
    ;(function (w, d, s, l, i) {
      w[l] = w[l] || []
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : ''
      j.async = true
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
      f.parentNode.insertBefore(j, f)
    })(window, document, 'script', 'dataLayer', 'GTM-PHD2KSF')
  </script>
  <!-- End Google Tag Manager -->
</svelte:head>

<nav class="gnb">
  <ul>
    <li><a sveltekit:prefetch href="/">블로그 홈</a></li>
    <li><a sveltekit:prefetch href="/posts/about">소개</a></li>
  </ul>
</nav>

<main>
  <slot />
</main>

<footer>
  {conf.copyright},
  <a href="https://twitter.com{conf.authroTwitter}" class="external">@{conf.authroTwitter}</a>
</footer>

<style lang="postcss">
  .gnb {
    ul {
      display: flex;
      padding: 0;
      margin: 1em 0;
      gap: 0.75em;
      list-style-type: none;
    }
  }

  footer {
    padding-top: 0.5em;
    border-top: 1px solid #0006;
    margin-top: 5rem;
    font-size: smaller;
  }
</style>
