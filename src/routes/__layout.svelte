<script lang="ts">
  import '$lib/css/root.css'
</script>

<nav class="gnb">
  <ul>
    <li><a href="/">블로그 홈</a></li>
    <li><a href="/posts/about">소개</a></li>
  </ul>
</nav>

<main>
  <slot />
</main>

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
</style>
