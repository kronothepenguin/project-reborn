<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { useTabsContext, type TabRegistration } from "../context";

  interface Props extends HTMLButtonAttributes {
    value: string;
    children: Snippet;
  }

  let { value, disabled = false, children, onclick, ...rest }: Props = $props();

  const tabs = useTabsContext();
  let element = $state<HTMLButtonElement>();

  $effect(() => {
    const registration: TabRegistration = {
      value,
      disabled: () => Boolean(disabled),
      element: () => element,
    };
    tabs.registerTab(registration);
    return () => tabs.unregisterTab(registration);
  });

  const selected = $derived(tabs.value === value);
</script>

<button
  {...rest}
  bind:this={element}
  type="button"
  role="tab"
  aria-selected={selected}
  tabindex={selected ? 0 : -1}
  {disabled}
  onclick={(event) => {
    if (!disabled) tabs.select(value);
    onclick?.(event);
  }}
>
  <span>{@render children()}</span>
</button>
