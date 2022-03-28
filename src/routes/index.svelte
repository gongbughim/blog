<script lang="ts">
  import type { ArticleMeta } from '$lib/types'

  export let posts: ArticleMeta[] = []
</script>

<svelte:head>
  <title>Blog</title>
  <meta name="description" content="개발 이야기하는 블로그" />
</svelte:head>

<h1>각종 공부 블로그</h1>

<p class="brief">공부한거 정리하는 블로그입니다. 주로 프로그래밍 이야기를 합니다.</p>

<ul class="posts">
  {#each posts as post}
    <li>
      <article>
        <h2 class="title"><a href={`/posts/${post.id}`}>{post.title}</a></h2>
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
    font-weight: normal;
    letter-spacing: -0.025em;
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

    li {
      margin: 1em 0 3em;
    }

    article {
      .title {
        font-size: 1.5em;
      }
    }
  }
</style>
