<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Paper from "./paper.svelte";

  type PaperProps = ComponentProps<typeof Paper>;

  type Variant = PaperProps["variant"];
  type Color =
    | "black"
    | "blue"
    | "lightblue"
    | "orange"
    | "green"
    | "darkred"
    | "brown"
    | "settings"
    | "red"
    | "hcred"
    | "lightbrown"
    | "activehomes"
    | "white"
    | "promogray"
    | "loginbox"
    | "rooms"
    | "club";

  interface Props extends PaperProps {
    variant?: Variant;
    color?: Color;
    header?: Snippet;
    children: Snippet;
  }

  // Holo's white boxes have a white title bar with black text.
  const colorClasses: Record<Color, string> = {
    black: "bg-black text-white",
    blue: "bg-sky-700 text-white",
    lightblue: "bg-sky-500 text-white",
    orange: "bg-orange-500 text-white",
    green: "bg-lime-600 text-white",
    darkred: "bg-orange-700 text-white",
    brown: "bg-yellow-700 text-white",
    settings: "bg-mist-600 text-white",
    red: "bg-orange-700 text-white",
    hcred: "bg-orange-700 text-white",
    lightbrown: "bg-yellow-600 text-white",
    activehomes: "bg-sky-500 text-white",
    promogray: "bg-orange-800 text-white",
    loginbox: "bg-neutral-500 text-white",
    rooms: "bg-cyan-800 text-white",
    club: "bg-amber-300 text-white",
    white: "bg-white text-black",
  };

  let {
    variant = "default",
    color = "white",
    header,
    children,
    ...rest
  }: Props = $props();
</script>

<Paper {variant} {...rest}>
  <div class="p-1">
    {#if header}
      <header
        class="rounded p-1 text-center font-bold {colorClasses[
          color
        ] ?? colorClasses.white}"
      >
        {@render header()}
      </header>
    {/if}
    <div class="p-2">{@render children()}</div>
  </div>
</Paper>
