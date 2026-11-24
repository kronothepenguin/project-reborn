<script lang="ts">
  import { Button, Spinner, Tab, TabList, Tabs } from "@project-reborn/components";
  import { onMount } from "svelte";
  import GroupPurchase, { type Limits } from "../groups/group-purchase.svelte";

  // source lists the habbo's groups and holds what the purchase dialog checks.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  type Group = { id: number; name: string; badge: string };

  let tab = $state("mine");
  let mine = $state<Group[]>([]);
  let hot = $state<Group[] | null>(null);
  let buying = $state(false);
  let limits = $state<Limits>({
    enabled: false,
    price: 0,
    credits: 0,
    owned: 0,
    maxOwned: 0,
    nameMax: 0,
    descriptionMax: 0,
  });

  onMount(() => {
    const element = document.getElementById(source) as HTMLElement;
    mine = [...element.querySelectorAll("li")].map((li) => ({
      id: Number(li.dataset.id),
      name: li.textContent ?? "",
      badge: li.dataset.badge ?? "",
    }));
    const data = element.dataset;
    limits = {
      enabled: data.enabled === "true",
      price: Number(data.price),
      credits: Number(data.credits),
      owned: Number(data.owned),
      maxOwned: Number(data.maxOwned),
      nameMax: Number(data.nameMax),
      descriptionMax: Number(data.descriptionMax),
    };
  });

  // The Hot Groups tab loads once, when it is first opened, as Holo's tab-ajax.
  $effect(() => {
    if (tab !== "hot" || hot !== null) return;
    fetch("/groups/random", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((answer: { groups: Group[] }) => (hot = answer.groups))
      .catch(() => (hot = []));
  });

  // Holo's two columns pair the groups into rows, and the rows alternate their
  // background, the first one grey.
  const rowClass = (index: number) =>
    Math.floor(index / 2) % 2 === 0 ? "bg-olive-200 hover:bg-blue-100" : "hover:bg-sky-50";
</script>

{#snippet list(groups: Group[])}
  <ul class="mt-3.5 flow-root">
    {#each groups as group, i (group.id)}
      <li
        class={["float-left w-1/2 bg-no-repeat", rowClass(i), i % 2 === 0 ? "bg-position-[15px_50%]" : "bg-position-[7px_50%]"]}
        style={`background-image: url(/habbo-imaging/badge/${encodeURIComponent(group.badge)})`}
      >
        <a
          class={[
            "mr-10 block h-[42px] py-0.5 pl-20 text-black no-underline hover:underline",
            i % 2 === 1 && "border-l border-olive-300",
          ]}
          href={`/groups/${group.id}`}>{group.name}</a
        >
      </li>
    {/each}
    {#if groups.length % 2 === 1}
      <li class={["float-left w-1/2", rowClass(groups.length)]}>
        <div class="mr-10 h-[42px] border-l border-olive-300 py-0.5 pl-17.5">&nbsp;</div>
      </li>
    {/if}
  </ul>
  <div class="flex justify-end px-5 pt-2.5"><Button onclick={() => (buying = true)}>Create/buy a Group</Button></div>
{/snippet}

<div class="relative">
  <h2 class="absolute top-0 left-0 pt-1 pl-3.5 text-xl font-bold text-sky-500">Groups</h2>
  <Tabs bind:value={tab} color="blue">
    <TabList>
      <Tab value="mine">My Groups</Tab>
      <Tab value="hot">Hot Groups</Tab>
    </TabList>
  </Tabs>
</div>
<div role="tabpanel" aria-label="My Groups" hidden={tab !== "mine"}>
  <div class="border-b border-dashed border-mauve-300 py-1.5 pl-5">
    View the groups you are in, create your own group, or get some inspiration from the 'Hot Groups'-tab!
  </div>
  <div class="pb-3.5">{@render list(mine)}</div>
</div>
<div role="tabpanel" aria-label="Hot Groups" hidden={tab !== "hot"}>
  {#if hot === null}
    <div class="py-2.5 text-center"><Spinner /></div>
  {:else}
    <div class="pb-3.5">{@render list(hot)}</div>
  {/if}
</div>
<GroupPurchase bind:open={buying} bind:limits />
