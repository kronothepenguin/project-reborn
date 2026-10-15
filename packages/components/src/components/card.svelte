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
    | "rooms";

  interface Props extends PaperProps {
    variant?: Variant;
    color?: Color;
    header?: Snippet;
    children: Snippet;
  }

  const colorClasses: Record<Color, string> = {
    black: "bg-black",
    blue: "bg-sky-700",
    lightblue: "bg-sky-500",
    orange: "bg-orange-500",
    green: "bg-lime-600",
    darkred: "bg-orange-700",
    brown: "bg-yellow-700",
    settings: "bg-mist-600",
    red: "bg-orange-700",
    hcred: "bg-orange-700",
    lightbrown: "bg-yellow-600",
    activehomes: "bg-sky-500",
    promogray: "bg-orange-800",
    loginbox: "bg-neutral-500",
    rooms: "bg-cyan-800",
    white: "bg-white",
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
        class="rounded p-1 text-center font-bold text-white {colorClasses[
          color
        ] ?? colorClasses.white}"
      >
        {@render header()}
      </header>
    {/if}
    <div class="p-2">{@render children()}</div>
  </div>
</Paper>
