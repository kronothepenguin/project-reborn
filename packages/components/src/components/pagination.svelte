<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  // Holo's page-num-list: the label, then one PaginationItem per page. A page
  // served with [[ ]] data writes its items in a [[ range ]].
  interface Props extends HTMLAttributes<HTMLElement> {
    label?: string;
    children: Snippet;
  }

  let { label = "View page:", children, ...rest }: Props = $props();
</script>

<nav aria-label="Pages" {...rest}>
  {label}
  {@render children()}
</nav>
