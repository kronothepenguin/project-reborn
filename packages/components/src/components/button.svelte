<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Variant = "default" | "green" | "dark" | "red" | "plain";
  type Size = "wide" | "compact";

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    href?: string;
    children: Snippet;
  }

  // The raised face: a lighter top half drawn by ::before, which moves to the
  // bottom half while pressed. Every variant but plain has it.
  const raised =
    "relative inline-flex items-center justify-center rounded border-2 border-black py-1 text-xs font-bold whitespace-nowrap before:absolute before:inset-x-px before:top-px before:h-1/2 before:rounded-t-[3px] before:content-[''] active:before:inset-x-px active:before:top-auto active:before:bottom-px active:before:rounded-t-none active:before:rounded-b-[3px] disabled:before:hidden";

  const variantClasses: Record<Variant, string> = {
    default: `${raised} text-black bg-mauve-300 hover:bg-olive-200 before:bg-olive-200 hover:before:bg-white`,
    green: `${raised} text-white bg-lime-700 hover:bg-green-600 before:bg-lime-600 hover:before:bg-lime-500`,
    dark: `${raised} text-white bg-olive-600 hover:bg-neutral-500 before:bg-olive-500 hover:before:bg-mist-400`,
    red: `${raised} text-white bg-red-700 hover:bg-red-600 before:bg-red-600 hover:before:bg-red-500`,
    // Housekeeping's flat submit button: a 1px border, no radius and no face.
    plain: "border border-black bg-olive-200 py-0.5 font-bold hover:bg-white",
  };

  const sizeClasses: Record<Size, string> = {
    wide: "px-4",
    compact: "px-2",
  };

  let {
    type = "button",
    variant = "default",
    size = "wide",
    href,
    children,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={href ? "a" : "button"}
  type={href ? undefined : type}
  {href}
  class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50 {variantClasses[variant]} {sizeClasses[size]}"
  {...rest}
>
  <span class="z-10">
    {@render children()}
  </span>
</svelte:element>
