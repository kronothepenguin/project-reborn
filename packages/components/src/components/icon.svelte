<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Variant =
    | "search"
    | "envelope"
    | "save"
    | "cancel"
    | "edit"
    | "purse"
    | "newtopic";

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    variant?: Variant;
  }

  // The sprite draws save, cancel and edit in white, for coloured buttons.
  const variantClasses: Record<Variant, string> = {
    search: "bg-position-[0_0]",
    envelope: "bg-position-[0_-49px]",
    save: "bg-position-[0_-96px]",
    cancel: "bg-position-[0_-145px]",
    edit: "bg-position-[0_-193px]",
    purse: "bg-position-[0_-241px]",
    newtopic: "bg-position-[0_-289px]",
  };

  let { variant = "search", ...rest }: Props = $props();
</script>

<span
  aria-hidden="true"
  class="sprite inline-block size-4 {variantClasses[variant] ??
    variantClasses.search}"
  {...rest}
></span>

<style>
  /* Longhands only: the background shorthand would reset the position classes,
     because this scoped selector outranks them. */
  .sprite {
    background-image: url(../assets/button_icons2.png);
    background-repeat: no-repeat;
  }
</style>
