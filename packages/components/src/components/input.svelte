<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "value"> {
    value?: string;
  }

  let { value = $bindable(""), ...rest }: Props = $props();
</script>

<input bind:value {...rest} />
