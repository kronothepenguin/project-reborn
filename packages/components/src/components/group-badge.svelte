<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLImgAttributes, "src"> {
    code: string;
  }

  let { code, alt = "", ...rest }: Props = $props();

  // Joined without encoding: at build time the code can be a [[ ]] placeholder,
  // which html/template escapes for this URL when the page is served.
  const src = $derived(`/habbo-imaging/badge/${code}`);
</script>

<img {src} {alt} {...rest} />
