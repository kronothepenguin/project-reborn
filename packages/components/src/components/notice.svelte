<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant = "red" | "green" | "orange" | "blue" | "darkgray";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    children: Snippet;
  }

  const variantClasses: Record<Variant, string> = {
    red: "bg-red-600",
    green: "bg-lime-600",
    orange: "bg-amber-500",
    blue: "bg-cyan-600",
    darkgray: "bg-mist-600",
  };

  let { variant = "red", children, ...rest }: Props = $props();
</script>

<div
  class="rounded p-1 text-center text-sm text-white {variantClasses[variant] ??
    variantClasses.red}"
  {...rest}
>
  {@render children()}
</div>
