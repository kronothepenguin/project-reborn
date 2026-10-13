<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends HTMLAnchorAttributes {
    children: Snippet;
  }

  let { children, ...rest }: Props = $props();
</script>

<a {...rest}>
  <span>{@render children()}</span>
</a>
