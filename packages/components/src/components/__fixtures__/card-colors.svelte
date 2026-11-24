<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Card from "../card.svelte";

  type Color = NonNullable<ComponentProps<typeof Card>["color"]>;

  const colors: Color[] = [
    "white",
    "black",
    "blue",
    "lightblue",
    "activehomes",
    "orange",
    "green",
    "red",
    "hcred",
    "darkred",
    "brown",
    "lightbrown",
    "settings",
    "promogray",
    "loginbox",
    "rooms",
    "club",
  ];
</script>

<div class="grid grid-cols-3 gap-2.5 bg-taupe-200 p-2.5">
  {#each colors as color (color)}
    <Card {color}>
      {#snippet header()}{color}{/snippet}
      <p>The box's content.</p>
    </Card>
  {/each}
</div>
