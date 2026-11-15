<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  // A section under a title bar: blue for navigation and forms, gold for data
  // lists (decision holo-port/0060).
  type Color = "blue" | "gold";

  interface Props extends HTMLAttributes<HTMLElement> {
    title: string;
    color?: Color;
    children: Snippet;
  }

  const colorClasses: Record<Color, string> = {
    blue: "bg-sky-700 text-white",
    gold: "bg-amber-300 text-black",
  };

  let { title, color = "blue", children, ...rest }: Props = $props();
</script>

<section class="border-2 border-black bg-white" {...rest}>
  <h2 class="border-b-2 border-black px-0.5 font-bold {colorClasses[color]}">
    {title}
  </h2>
  {@render children()}
</section>
