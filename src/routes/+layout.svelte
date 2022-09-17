<script lang="ts">
  import conf from '$lib/conf'
</script>

<svelte:head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

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
  <a href="https://twitter.com/{conf.authorTwitter}" class="external">Twitter</a> |
  <a href="https://github.com/{conf.authorGithub}" class="external">Github</a>
</footer>

<style lang="postcss" global>
  @import './root.css';
  @import 'prism-themes/themes/prism-vsc-dark-plus.css';

  .gnb {
    & ul {
      display: flex;
      padding: 0;
      margin: 1em 0;
      gap: 1em;
      list-style-type: none;
    }
  }

  footer {
    padding-top: 0.5em;
    border-top: 1px solid currentColor;
    margin-top: 5rem;
    font-size: smaller;
  }
</style>
