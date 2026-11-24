<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "type" | "checked"> {
    checked?: boolean;
    children: Snippet;
  }

  let {
    checked = $bindable(false),
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<label class={["flex items-center gap-1", className]}>
  <input
    {...rest}
    bind:checked
    type="checkbox"
    class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
  />
  <span>{@render children()}</span>
</label>
