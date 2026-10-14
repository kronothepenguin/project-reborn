<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Variant =
    "default" | "white" | "personal-info" | "nav" | "settings" | "yellow";

  interface Props extends HTMLAnchorAttributes {
    variant?: Variant;
    children: Snippet;
  }

  const variantClasses: Record<Variant, string> = {
    default: "text-orange-500 underline",
    white: "text-white underline",
    "personal-info": "text-white no-underline",
    nav: "text-blue-900 no-underline",
    settings: "text-olive-800 no-underline",
    yellow: "text-amber-300 underline",
  };

  let { variant = "default", children, ...rest }: Props = $props();
</script>

<a
  class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black {variantClasses[
    variant
  ] ?? variantClasses.default}"
  {...rest}
>
  <span>{@render children()}</span>
</a>
