<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLOlAttributes } from "svelte/elements";

  // The steps of a process in one row: an ordered list that numbers its Steps
  // with a CSS counter and draws an arrow after each but the last. It holds no
  // state, so a page the server fills chooses each Step's form.
  interface Props extends HTMLOlAttributes {
    children: Snippet;
  }

  let { class: className, children, ...rest }: Props = $props();
</script>

<ol
  {...rest}
  class={[
    "flex flex-wrap items-center gap-x-2 gap-y-2 [counter-reset:step] max-sm:gap-x-1.5",
    className,
  ]}
>
  {@render children()}
</ol>
