<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useTabsContext } from "../context";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    value: string;
    children: Snippet;
  }

  let { value, children, ...rest }: Props = $props();

  const tabs = useTabsContext();
  const selected = $derived(tabs.value === value);
</script>

{#if selected}
  <div {...rest} role="tabpanel">{@render children()}</div>
{/if}
