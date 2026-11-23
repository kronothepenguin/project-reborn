<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useTabsContext, type TabsColor } from "../context";

  // Holo's row of inner tabs: a line in the group's colour under the row, the
  // tabs at its right edge.
  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  const lineClasses: Record<TabsColor, string> = {
    blue: "border-sky-600",
    green: "border-lime-600",
    orange: "border-amber-500",
  };

  let { class: className, children, onkeydown, ...rest }: Props = $props();

  const tabs = useTabsContext();
</script>

<div
  {...rest}
  class={["flex justify-end gap-1.5 border-b px-1.5", lineClasses[tabs.color] ?? lineClasses.blue, className]}
  role="tablist"
  onkeydown={(event) => {
    tabs.keydown(event);
    onkeydown?.(event);
  }}
>
  {@render children()}
</div>
