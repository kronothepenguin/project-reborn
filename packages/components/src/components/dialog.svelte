<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLDialogAttributes, "open" | "onclose"> {
    open?: boolean;
    label?: string;
    onclose?: () => void;
    children: Snippet;
  }

  let {
    open = $bindable(false),
    label,
    onclose,
    children,
    onclick,
    ...rest
  }: Props = $props();

  let element = $state<HTMLDialogElement>();

  $effect(() => {
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
    } else if (!open && element.open) {
      element.close();
    }
  });
</script>

<dialog
  {...rest}
  bind:this={element}
  aria-label={label}
  onclick={(event) => {
    if (event.target === element) element?.close();
    onclick?.(event);
  }}
  onclose={() => {
    open = false;
    onclose?.();
  }}
>
  {@render children()}
</dialog>
