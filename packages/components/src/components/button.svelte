<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Variant = "default" | "green" | "dark" | "red";
  type Size = "wide" | "compact";

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    children: Snippet;
  }

  const variantClasses: Record<Variant, string> = {
    default:
      "text-black bg-mauve-300 hover:bg-olive-200 before:bg-olive-200 hover:before:bg-white",
    green:
      "text-white bg-lime-700 hover:bg-green-600 before:bg-lime-600 hover:before:bg-lime-500",
    dark: "text-white bg-olive-600 hover:bg-neutral-500 before:bg-olive-500 hover:before:bg-mist-400",
    red: "text-white bg-red-700 hover:bg-red-600 before:bg-red-600 hover:before:bg-red-500",
  };

  const sizeClasses: Record<Size, string> = {
    wide: "px-4",
    compact: "px-2",
  };

  let {
    type = "button",
    variant = "default",
    size = "wide",
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  class="relative inline-flex items-center justify-center rounded border-2 border-black py-1 text-xs font-bold whitespace-nowrap before:absolute before:inset-x-px before:top-px before:h-1/2 before:rounded-t-[3px] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:before:inset-x-px active:before:top-auto active:before:bottom-px active:before:rounded-t-none active:before:rounded-b-[3px] disabled:cursor-not-allowed disabled:opacity-50 disabled:before:hidden {variantClasses[
    variant
  ]} {sizeClasses[size]}"
  {...rest}
>
  <span class="z-10">
    {@render children()}
  </span>
</button>
