<script lang="ts">
  import { untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setTabsContext, type TabRegistration } from "../context";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    children: Snippet;
  }

  let { value = $bindable(), children, onkeydown, ...rest }: Props = $props();

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

  function handleKeydown(event: KeyboardEvent) {
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
    select,
    registerTab,
    unregisterTab,
  });
</script>

<div
  {...rest}
  role="tablist"
  onkeydown={(event) => {
    handleKeydown(event);
    onkeydown?.(event);
  }}
>
  {@render children()}
</div>
