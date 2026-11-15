<script lang="ts">
  // The preview named preview follows the topstory field named field. A path is
  // the CMS's, so it loads from site.url, which the preview's data-site holds:
  // housekeeping may run on another port. It renders nothing of its own.
  interface Props {
    field: string;
    preview: string;
  }

  let { field, preview }: Props = $props();

  $effect(() => {
    const input = document.getElementById(field) as HTMLInputElement;
    const image = document.getElementById(preview) as HTMLImageElement;
    const follow = () => {
      const address = input.value.trim();
      image.src = address.startsWith("/") ? `${image.dataset.site}${address}` : address;
    };
    input.addEventListener("input", follow);
    return () => input.removeEventListener("input", follow);
  });
</script>
