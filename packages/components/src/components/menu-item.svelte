<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { useMenuContext } from "../context";

  interface Props extends HTMLButtonAttributes {
    value: string;
    selected?: boolean;
    children: Snippet;
  }

  let {
    value,
    selected = false,
    disabled = false,
    children,
    onclick,
    ...rest
  }: Props = $props();

  const menu = useMenuContext();
</script>

<button
  {...rest}
  type="button"
  role="menuitemradio"
  aria-checked={selected}
  {disabled}
  onclick={(event) => {
    if (!disabled) menu.select(value);
    onclick?.(event);
  }}
>
  <span>{@render children()}</span>
</button>
