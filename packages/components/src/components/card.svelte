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
    orange: "bg-orange-550 text-white",
    green: "bg-lime-550 text-white",
    darkred: "bg-red-650 text-white",
    brown: "bg-yellow-650 text-white",
    settings: "bg-mist-600 text-white",
    red: "bg-red-550 text-white",
    hcred: "bg-red-550 text-white",
    lightbrown: "bg-yellow-550 text-white",
    activehomes: "bg-sky-450 text-white",
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

<!-- Holo's box: the title bar inset 4px from the frame, bold 14px on a 17px
     line with 4px above and below, and the content inset 8px 15px. -->
<Paper {variant} {...rest}>
  {#if header}
    <div class="px-1 pt-1">
      <header
        class="rounded px-2.5 py-1 text-center text-sm leading-[17px] font-bold {colorClasses[
          color
        ] ?? colorClasses.white}"
      >
        {@render header()}
      </header>
    </div>
  {/if}
  <div class="px-4 py-2">{@render children()}</div>
</Paper>
