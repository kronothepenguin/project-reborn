<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setMenuContext } from "../context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onselect"> {
    label?: string;
    trigger?: Snippet;
    disabled?: boolean;
    onselect?: (value: string) => void;
    children: Snippet;
  }

  let {
    label,
    trigger,
    disabled = false,
    onselect,
    children,
    ...rest
  }: Props = $props();

  let popover = $state<HTMLDivElement>();
  let open = $state(false);

  function toggle() {
    if (disabled || !popover) return;
    if (open) {
      popover.hidePopover();
    } else {
      popover.showPopover();
    }
  }

  function select(value: string) {
    onselect?.(value);
    popover?.hidePopover();
  }

  setMenuContext({
    get open() {
      return open;
    },
    select,
  });
</script>

<div {...rest}>
  <button
    type="button"
    {disabled}
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={toggle}
  >
    {#if trigger}
      {@render trigger()}
    {:else}
      <span>{label}</span>
    {/if}
  </button>
  <div
    bind:this={popover}
    popover
    role="menu"
    ontoggle={(event) => (open = event.newState === "open")}
  >
    {@render children()}
  </div>
</div>
