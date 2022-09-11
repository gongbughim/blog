<script lang="ts">
  import conf from '$lib/conf'

  import type { PageData } from './$types'

  export let data: PageData
  let posts = data.posts
  let publishedPosts = posts.filter(p => !p.draft)
</script>

<svelte:head>
  <title>{conf.title}</title>
  <meta name="description" content={conf.description} />
</svelte:head>

<h1>{conf.title}</h1>

<p class="brief">{conf.description}</p>

<ul class="posts">
  {#each publishedPosts as post}
    <li>
      <article>
        <h2 class="title"><a sveltekit:prefetch href={`/posts/${post.id}`}>{post.title}</a></h2>
        <time class="published-at">{post.publishedAt}</time>
        <p class="summary">{post.summary}</p>
      </article>
    </li>
  {/each}
</ul>

<style lang="postcss">
  h1,
  h2 {
    margin: 0;
    line-height: 1.4;
  }

  h1 {
    font-size: 3rem;
  }

  .published-at {
    font-size: 0.9em;
  }

  .brief {
    margin: 1em 0 6em;
  }

  .posts {
    padding: 0;
    margin: 0;
    list-style-type: none;

    & li {
      margin: 1em 0 3.5em;
    }

    & article {
      & .title {
        font-size: 1.5em;
      }
    }
  }
</style>
