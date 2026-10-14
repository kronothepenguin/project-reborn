<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Paper from "./paper.svelte";

  interface Props extends ComponentProps<typeof Paper> {
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
