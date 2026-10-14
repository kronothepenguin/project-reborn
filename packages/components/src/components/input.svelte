<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Variant = "default" | "border";
  type Size = "default" | "lg";

  interface Props extends Omit<HTMLInputAttributes, "value" | "size"> {
    value?: string;
    variant?: Variant;
    size?: Size;
    invalid?: boolean;
  }

  const variantClasses: Record<Variant, string> = {
    default: "",
    border: "border border-neutral-600",
  };

  const sizeClasses: Record<Size, string> = {
    default: "p-0.5",
    lg: "p-1",
  };

  let {
    value = $bindable(""),
    variant = "default",
    size = "default",
    invalid = false,
    ...rest
  }: Props = $props();
</script>

<input
  bind:value
  class="text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black {invalid
    ? 'bg-rose-300'
    : 'bg-white'} {variantClasses[variant] ??
    variantClasses.default} {sizeClasses[size] ?? sizeClasses.default}"
  {...rest}
/>
