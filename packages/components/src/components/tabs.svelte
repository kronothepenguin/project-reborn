<script lang="ts">
  import { untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setTabsContext, type TabRegistration, type TabsColor } from "../context";

  // A group of tabs: a TabList of Tab and a TabPanel for each. The colour is
  // the group's, so the row's line and every tab follow it.
  interface Props extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    color?: TabsColor;
    children: Snippet;
  }

  let { value = $bindable(), color = "blue", children, ...rest }: Props = $props();

  let tabs = $state.raw<TabRegistration[]>([]);

  const selectedValue = $derived(
    value ?? tabs.find((tab) => !tab.disabled())?.value,
  );

  function select(next: string) {
    value = next;
  }

  function registerTab(registration: TabRegistration) {
    untrack(() => {
      tabs = [...tabs, registration];
    });
  }

  function unregisterTab(registration: TabRegistration) {
    untrack(() => {
      tabs = tabs.filter((tab) => tab !== registration);
    });
  }

  function keydown(event: KeyboardEvent) {
    const enabled = tabs.filter((tab) => !tab.disabled());
    if (enabled.length === 0) return;

    const current = enabled.findIndex((tab) => tab.value === selectedValue);
    let next: TabRegistration | undefined;
    switch (event.key) {
      case "ArrowRight":
        next = enabled[(current + 1) % enabled.length];
        break;
      case "ArrowLeft":
        next = enabled[(current - 1 + enabled.length) % enabled.length];
        break;
      case "Home":
        next = enabled[0];
        break;
      case "End":
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    select(next.value);
    next.element()?.focus();
  }

  setTabsContext({
    get value() {
      return selectedValue;
    },
    get color() {
      return color;
    },
    select,
    keydown,
    registerTab,
    unregisterTab,
  });
</script>

<div {...rest}>
  {@render children()}
</div>
