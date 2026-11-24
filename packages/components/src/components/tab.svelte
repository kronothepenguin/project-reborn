<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { useTabsContext, type TabRegistration, type TabsColor } from "../context";

  interface Props extends HTMLButtonAttributes {
    value: string;
    children: Snippet;
  }

  // Holo's inner tab: 25px tall, filled with the group's colour and white
  // text, lighter while pointed at; the selected one white with an outline in
  // the colour and bold black text. It sits 1px low, so it covers the row's
  // line.
  const tab =
    "relative top-px h-[25px] max-w-[188px] overflow-hidden rounded-t-[3px] border border-b-0 px-3 pt-1 text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-default disabled:opacity-50";

  const colorClasses: Record<TabsColor, { idle: string; selected: string }> = {
    blue: {
      idle: "border-blue-450 bg-blue-450 text-white enabled:hover:bg-sky-425",
      selected: "border-blue-450 bg-white font-bold text-black",
    },
    green: {
      idle: "border-lime-600 bg-lime-600 text-white enabled:hover:bg-lime-525",
      selected: "border-lime-600 bg-white font-bold text-black",
    },
    orange: {
      idle: "border-amber-500 bg-amber-500 text-white enabled:hover:bg-amber-400",
      selected: "border-amber-500 bg-white font-bold text-black",
    },
  };

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
  const look = $derived(colorClasses[tabs.color] ?? colorClasses.blue);
</script>

<button
  {...rest}
  class={[tab, selected ? look.selected : look.idle]}
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
