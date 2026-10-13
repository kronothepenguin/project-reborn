<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    children: Snippet;
  }

  let { type = "button", children, ...rest }: Props = $props();
</script>

<button {type} {...rest}>
  <span>{@render children()}</span>
</button>
