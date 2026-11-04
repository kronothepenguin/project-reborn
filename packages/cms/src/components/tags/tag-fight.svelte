<script lang="ts">
  import { Button, Input } from "@project-reborn/components";
  import end0 from "../../assets/tags/tagfight_end_0.gif";
  import end1 from "../../assets/tags/tagfight_end_1.gif";
  import end2 from "../../assets/tags/tagfight_end_2.gif";
  import loop from "../../assets/tags/tagfight_loop.gif";
  import start from "../../assets/tags/tagfight_start.gif";

  type Result = { hits1: number; hits2: number };

  let tag1 = $state("");
  let tag2 = $state("");
  let fighting = $state(false);
  let result = $state<Result | null>(null);
  // Holo's "Again?" brought back a button it labelled Start, not Fight!.
  let again = $state(false);

  // Holo's endings: 0 for a tie, 1 when the second tag wins, 2 when the first does.
  const end = $derived(
    result === null || result.hits1 === result.hits2 ? 0 : result.hits1 > result.hits2 ? 2 : 1,
  );
  const image = $derived(fighting ? loop : result ? [end0, end1, end2][end] : start);

  function fight() {
    if (!tag1 || !tag2) return;
    fighting = true;
    setTimeout(run, 3000);
  }

  async function run() {
    try {
      const response = await fetch("/tags/fight", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ tag1, tag2 }),
      });
      if (response.ok) result = await response.json();
    } finally {
      fighting = false;
    }
  }

  function newFight() {
    result = null;
    tag1 = "";
    tag2 = "";
    again = true;
  }
</script>

{#if fighting}
  <div>The fight ... is on ...</div>
{:else if result}
  <div>
    {result.hits1 === result.hits2 ? "Tie!" : "The winner is:"}<br />
    {#if end === 2}<b>{tag1}</b>{:else}{tag1}{/if} ({result.hits1}) hits<br />
    {#if end === 1}<b>{tag2}</b>{:else}{tag2}{/if} ({result.hits2}) hits
  </div>
{:else}
  <div>
    <label class="mb-[5px] block">First tag<br /><Input maxlength={30} variant="border" bind:value={tag1} /></label>
    <label class="mb-[5px] block">Second tag<br /><Input maxlength={30} variant="border" bind:value={tag2} /></label>
  </div>
{/if}
<div class="mx-[5px] my-2.5 flow-root text-center">
  <img class="mx-auto" src={image.src} alt="" width={image.width} height={image.height} />
  {#if result}
    <div class="float-right mt-[5px]"><Button size="compact" onclick={newFight}>Again?</Button></div>
  {:else if !fighting}
    <div class="float-right mt-[5px]"><Button size="compact" onclick={fight}>{again ? "Start" : "Fight!"}</Button></div>
  {/if}
</div>
<div class="hidden">
  {#each [end0, end1, end2, loop, start] as preload (preload.src)}
    <img src={preload.src} alt="" width="1" height="1" />
  {/each}
</div>
