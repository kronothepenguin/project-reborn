<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useTabsContext, type TabsColor } from "../context";

  // Holo's row of inner tabs: 25px tall over a line in the group's colour that
  // runs the row's full width, the tabs at its right edge, 4px apart. Inside a
  // box it stands on the box's frame, with no inset, so the line runs from one
  // edge of the box to the other.
  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  const lineClasses: Record<TabsColor, string> = {
    blue: "border-blue-450",
    green: "border-lime-600",
    orange: "border-amber-500",
  };

  let { class: className, children, onkeydown, ...rest }: Props = $props();

  const tabs = useTabsContext();
</script>

<div
  {...rest}
  class={["flex h-[26px] justify-end gap-1 border-b px-1", lineClasses[tabs.color] ?? lineClasses.blue, className]}
  role="tablist"
  onkeydown={(event) => {
    tabs.keydown(event);
    onkeydown?.(event);
  }}
>
  {@render children()}
</div>
