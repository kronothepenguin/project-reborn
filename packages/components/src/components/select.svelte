<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLSelectAttributes, "value"> {
    value?: string;
    children: Snippet;
  }

  let { value = $bindable(), children, ...rest }: Props = $props();
</script>

<select
  bind:value
  class="border border-neutral-600 bg-white p-0.5 text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
  {...rest}
>
  {@render children()}
</select>
