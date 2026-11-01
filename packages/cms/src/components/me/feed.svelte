<script lang="ts">
  import { onMount } from "svelte";

  // Each alert is a plain form, which works without JavaScript. With it, an alert
  // leaves the feed at once and the page stays, as Holo's did.
  interface Props {
    list: string;
  }

  let { list }: Props = $props();

  onMount(() => {
    const feed = document.getElementById(list) as HTMLElement;
    feed.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      form.closest("li")?.remove();
      fetch(form.action, { method: "POST" });
    });
  });
</script>
