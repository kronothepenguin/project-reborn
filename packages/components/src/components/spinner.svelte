<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLSpanElement>;

  let { ...rest }: Props = $props();
</script>

<span
  class="spinner inline-block h-1.5 w-[29px] bg-no-repeat"
  role="status"
  aria-label="Loading"
  {...rest}
></span>

<style>
  .spinner {
    background-image: url(../assets/progress-bubbles.gif);
  }
</style>
