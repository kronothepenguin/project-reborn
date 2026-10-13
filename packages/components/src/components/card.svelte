<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Paper from "./paper.svelte";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    header?: Snippet;
    children: Snippet;
  }

  let { header, children, ...rest }: Props = $props();
</script>

<Paper {...rest}>
  {#if header}
    <header>{@render header()}</header>
  {/if}
  <div>{@render children()}</div>
</Paper>
