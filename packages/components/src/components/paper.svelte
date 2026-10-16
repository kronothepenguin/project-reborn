<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant =
    | "default"
    | "login"
    | "gray"
    | "black"
    | "hc"
    | "yellow"
    | "lightgreen"
    | "blue"
    | "room pattern";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    children: Snippet;
  }

  const variantClasses: Record<Variant, string> = {
    default: "bg-white",
    login: "bg-olive-400",
    gray: "bg-neutral-400",
    black: "bg-olive-950",
    hc: "bg-amber-100",
    yellow: "bg-amber-300",
    lightgreen: "bg-mist-200",
    blue: "bg-sky-300",
    "room pattern": "bg-cyan-600",
  };

  let { variant = "default", children, ...rest }: Props = $props();
</script>

<div
  class="rounded-lg border border-b-[3px] border-black/20 {variantClasses[
    variant
  ] ?? variantClasses.default}"
  {...rest}
>
  {@render children()}
</div>
