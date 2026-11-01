<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTableAttributes } from "svelte/elements";

  interface Props extends HTMLTableAttributes {
    children: Snippet;
  }

  // In a constant because the server renderer escapes a literal class twice when
  // the element also takes a spread, which breaks the & of these variants.
  const classes =
    "w-full border-collapse text-left [&_tbody_tr:nth-child(even)]:bg-neutral-100 [&_td]:p-1 [&_td]:align-top [&_th]:bg-olive-200 [&_th]:p-1 [&_th]:font-bold";

  let { children, ...rest }: Props = $props();
</script>

<table class={classes} {...rest}>
  {@render children()}
</table>
