<script lang="ts">
  import { Avatar, Bubble } from "@project-reborn/components";
  import { onMount } from "svelte";
  import offline from "../../assets/offline.gif";
  import online from "../../assets/online.gif";
  import skeleton from "../../assets/community/habbo_skeleton.gif";
  import stripes from "../../assets/community/stripepattern.gif";

  type Habbo = { name: string; figure: string; created: string; motto: string; online: boolean };

  // source is the hidden list the page fills with the habbos and the imager.
  let { source }: { source: string } = $props();

  let imagingUrl = $state("");
  let habbos = $state<Habbo[]>([]);
  let shown = $state<boolean[]>([]);
  let tip = $state(-1);

  // Holo's grid: three rows of six, 62 pixels apart and 45 below each other, the
  // middle row 30 pixels further left.
  function place(i: number) {
    const row = Math.floor(i / 6);
    return { left: (row === 1 ? 20 : 50) + (i % 6) * 62, top: 10 + row * 45 };
  }

  onMount(() => {
    const list = document.getElementById(source);
    if (!list) return;
    imagingUrl = list.dataset.imaging ?? "";
    const found = [...list.querySelectorAll<HTMLElement>("li")].slice(0, 18).map((li) => ({
      name: li.dataset.name ?? "",
      figure: li.dataset.figure ?? "",
      created: li.dataset.created ?? "",
      motto: li.dataset.motto ?? "",
      online: li.dataset.online === "true",
    }));
    habbos = found;
    shown = found.map(() => false);
    // Holo let each habbo appear within 0.7 seconds, one by one at random.
    const timers = found.map((_, i) => setTimeout(() => (shown[i] = true), Math.floor(Math.random() * 700)));
    return () => timers.forEach(clearTimeout);
  });
</script>

<!-- The stripes fill the box under its title, past the card's inset, as
     Holo's list container; Holo's grid of habbos, 435x230, stands at its left
     at its own size. -->
<div id="homes-habblet-list-container" class="-mx-4 -my-2 pb-2.5" style={`background-image: url(${stripes.src})`}>
<div class="relative h-[230px] w-[435px]">
  {#each habbos as habbo, i (i)}
    {@const at = place(i)}
    <a
      href={`/home?name=${encodeURIComponent(habbo.name)}`}
      aria-label={habbo.name}
      class="absolute block h-[110px] w-16 bg-no-repeat"
      style={`left: ${at.left}px; top: ${at.top}px;${shown[i] ? "" : ` background-image: url(${skeleton.src})`}`}
      onmouseenter={() => (tip = i)}
      onmouseleave={() => (tip = -1)}
      onfocus={() => (tip = i)}
      onblur={() => (tip = -1)}
    >
      {#if shown[i]}
        <Avatar
          {imagingUrl}
          figure={habbo.figure}
          size="b"
          direction={4}
          headDirection={4}
          gesture="sml"
          alt=""
          width="64"
          height="110"
        />
      {/if}
    </a>
  {/each}
  {#if tip >= 0}
    {@const at = place(tip)}
    <!-- Holo hooked the tip's bottom right corner to the habbo's top right one, 85 pixels right and 40 down. -->
    <div role="tooltip" class="pointer-events-none absolute z-10" style={`left: ${at.left - 107}px; bottom: ${230 - at.top - 40}px`}>
      <Bubble>
        <div class="h-4 bg-no-repeat font-bold" style={`background-image: url(${habbos[tip].online ? online.src : offline.src}); background-position: 70%`}>
          {habbos[tip].name}
        </div>
        Habbo created on: {habbos[tip].created}
        <p class="pt-2 text-mist-600">{habbos[tip].motto}</p>
      </Bubble>
    </div>
  {/if}
</div>
</div>
