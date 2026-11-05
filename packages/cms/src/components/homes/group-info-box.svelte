<script lang="ts">
  import { GroupBadge, Spinner } from "@project-reborn/components";
  import { onMount } from "svelte";

  // groupinfo.php's box, loading first as Holo's widget did, with the
  // description's lines kept as nl2br kept them.
  interface Props {
    group: string;
    onclose: () => void;
  }

  let { group, onclose }: Props = $props();

  type Info = { id: number; name: string; badge: string; created: string; description: string };

  let info = $state<Info | null | undefined>(undefined);

  onMount(async () => {
    try {
      const response = await fetch(`/groups/${group}/info`, { headers: { Accept: "application/json" } });
      info = response.ok ? await response.json() : null;
    } catch {
      info = null;
    }
  });
</script>

{#snippet minus()}
  <button
    type="button"
    class="float-right mt-0.5 size-4 cursor-pointer bg-[url(/web-gallery/v2/images/myhabbo_icons.png)] bg-position-[0_-197px] bg-no-repeat"
    aria-label="Close"
    onclick={onclose}
  ></button>
{/snippet}

{#if info === undefined}
  <div>
    <div class="flow-root">{@render minus()}</div>
    <p class="text-center"><Spinner /></p>
  </div>
{:else}
  <div class="mb-0.5 border border-white pb-1 pl-1">
    <div class="float-right size-[18px]">{@render minus()}</div>
    {#if info}
      <div class="float-right mx-0.5 mt-1.5 mb-0.5">
        <a href={`/groups/${info.id}`}><GroupBadge code={info.badge} alt={info.name} /></a>
      </div>
      <h4 class="m-0 p-0.5 text-[11px] font-bold"><a class="text-black" href={`/groups/${info.id}`}>{info.name}</a></h4>
      <p class="m-0 p-0.5">Group created:<br /><b>{info.created}</b></p>
      <div class="clear-both mr-1.5 h-20 overflow-auto border-t border-dashed border-black pt-0.5">
        {#each info.description.split("\n") as line, i (i)}{#if i > 0}<br />{/if}{line}{/each}
      </div>
    {:else}
      Invalid group or no group supplied.
    {/if}
  </div>
{/if}
