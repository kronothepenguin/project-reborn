<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTableAttributes } from "svelte/elements";

  type Variant = "list" | "form";

  interface Props extends HTMLTableAttributes {
    variant?: Variant;
    children: Snippet;
  }

  // In constants because the server renderer escapes a literal class twice when
  // the element also takes a spread, which breaks the & of these variants.
  const variantClasses: Record<Variant, string> = {
    list: "w-full border-collapse text-left [&_tbody_tr:nth-child(even)]:bg-amber-100 [&_td]:p-1 [&_td]:align-top [&_th]:bg-amber-300 [&_th]:p-1 [&_th]:font-bold",
    form: "w-full border-collapse text-left [&_td]:p-1 [&_td]:align-top",
  };

  let { variant = "list", children, ...rest }: Props = $props();
</script>

<table class={variantClasses[variant]} {...rest}>
  {@render children()}
</table>
