<script lang="ts">
  import { onMount } from "svelte";

  // What iot/header.php's scrollDown and go.php's Close buttons did: the window
  // scrolls to its foot once it has loaded, and an element marked data-close
  // closes it.
  onMount(() => {
    const scrollDown = () => window.scroll(0, 10000);
    if (document.readyState === "complete") scrollDown();
    else window.addEventListener("load", scrollDown, { once: true });
    const close = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("[data-close]")) window.close();
    };
    document.addEventListener("click", close);
    return () => {
      window.removeEventListener("load", scrollDown);
      document.removeEventListener("click", close);
    };
  });
</script>
