<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Tail = "top" | "bottom";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    tail?: Tail;
    children: Snippet;
  }

  const tailClasses: Record<Tail, string> = {
    top: "before:-top-1.5 before:border-t before:border-l",
    bottom: "before:-bottom-1.5 before:border-r before:border-b",
  };

  let { tail = "bottom", class: className, children, ...rest }: Props = $props();
</script>

<div
  class={[
    "relative w-64 rounded border border-black bg-white p-2 text-xs text-black before:absolute before:left-4 before:size-2.5 before:rotate-45 before:border-black before:bg-white",
    tailClasses[tail] ?? tailClasses.bottom,
    className,
  ]}
  {...rest}
>
  {@render children()}
</div>
