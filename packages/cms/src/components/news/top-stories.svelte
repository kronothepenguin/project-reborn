<script lang="ts">
  import { onMount } from "svelte";

  // source holds the news promo's stories. Holo turned them every 10 seconds,
  // with a fade of 0.8 seconds, and never while the pointer was over them.
  let { source }: { source: string } = $props();

  onMount(() => {
    const box = document.getElementById(source);
    const stories = box ? [...box.querySelectorAll<HTMLElement>("[data-story]")] : [];
    if (!box || stories.length < 2) return;
    let current = 0;
    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    box.addEventListener("mouseover", pause);
    box.addEventListener("mouseout", resume);
    const timer = setInterval(() => {
      if (paused) return;
      stories[current].dataset.story = "hidden";
      current = (current + 1) % stories.length;
      stories[current].dataset.story = "shown";
    }, 10000);
    return () => {
      clearInterval(timer);
      box.removeEventListener("mouseover", pause);
      box.removeEventListener("mouseout", resume);
    };
  });
</script>
