<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLLabelElement> {
    label: string;
    help?: string;
    error?: string;
    disabled?: boolean;
    invalid?: boolean;
    children: Snippet;
  }

  let {
    label,
    help,
    error,
    disabled = false,
    invalid = false,
    children,
    ...rest
  }: Props = $props();

  const isInvalid = $derived(invalid || Boolean(error));
</script>

<label
  {...rest}
  aria-invalid={isInvalid ? "true" : undefined}
  data-disabled={disabled ? "" : undefined}
  data-invalid={isInvalid ? "" : undefined}
>
  <span>{label}</span>
  {@render children()}
  {#if help}
    <span>{help}</span>
  {/if}
  {#if error}
    <span>{error}</span>
  {/if}
</label>
