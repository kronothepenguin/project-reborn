<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  type Size = "s" | "b";

  interface Props extends Omit<HTMLImgAttributes, "src"> {
    imagingUrl: string;
    figure: string;
    size?: Size;
    direction?: number;
    headDirection?: number;
    gesture?: string;
  }

  let {
    imagingUrl,
    figure,
    size = "b",
    direction = 4,
    headDirection = 4,
    gesture = "sml",
    alt = "",
    ...rest
  }: Props = $props();

  // Joined without encoding: at build time the values can be [[ ]] placeholders,
  // which html/template escapes for this URL when the page is served.
  const src = $derived(
    `${imagingUrl}?figure=${figure}&size=${size}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}`,
  );
</script>

<img {src} {alt} {...rest} />
