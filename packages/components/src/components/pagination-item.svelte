<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  // One page of a Pagination: the current page is plain text, any other a link.
  // The rest of the attributes go to the link.
  interface Props extends HTMLAnchorAttributes {
    current?: boolean;
    children: Snippet;
  }

  let { href, current = false, children, ...rest }: Props = $props();
</script>

{#if current}
  <span aria-current="page">{@render children()}</span>
{:else}
  <a class="text-black underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" {href} {...rest}
    >{@render children()}</a
  >
{/if}
