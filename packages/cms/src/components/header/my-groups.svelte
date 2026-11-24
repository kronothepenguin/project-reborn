<script lang="ts">
  import { Spinner } from "@project-reborn/components";
  import GroupPurchase, { type Limits } from "../groups/group-purchase.svelte";

  // The header's My Groups, Holo's quick menu tab. The island stands on every
  // page, outside the layout's signed-in branch, since the first island of a page
  // carries Astro's script for all of them; it shows itself to signed-in visitors
  // alone. The list comes once, the first time it opens, as quickmenu.php's did.
  interface Props {
    signedIn: string;
  }

  let { signedIn }: Props = $props();

  type Group = { id: number; name: string; favourite: boolean; admin: boolean; owner: boolean };

  let open = $state(false);
  let groups = $state<Group[] | null>(null);
  let buying = $state(false);
  let tabWidth = $state(0);
  let limits = $state<Limits>({
    enabled: false,
    price: 0,
    credits: 0,
    owned: 0,
    maxOwned: 0,
    nameMax: 0,
    descriptionMax: 0,
  });

  async function load() {
    try {
      const response = await fetch("/me/groups", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const answer = (await response.json()) as { groups: Group[]; purchase: Limits };
      limits = answer.purchase;
      groups = answer.groups;
    } catch {
      // The spinner stays, and the next opening asks again.
    }
  }

  function toggle(event: MouseEvent) {
    event.stopPropagation();
    open = !open;
    if (open && groups === null) load();
  }

  const icon = "float-right block size-4 bg-[url(/web-gallery/v2/images/info_icons.png)] bg-no-repeat";
</script>

<svelte:window onclick={() => (open = false)} />

{#if signedIn === "true"}
  <div class="relative text-base">
    <ul class="flow-root">
      <li class="float-left h-8" bind:clientWidth={tabWidth}>
        <button
          type="button"
          class={[
            "float-left cursor-pointer px-3.5 py-1 leading-6 font-bold outline-none hover:underline",
            open ? "bg-[url(/web-gallery/v2/images/quickmenu.png)] bg-position-[0_0] bg-no-repeat text-black" : "text-olive-500",
          ]}
          aria-expanded={open}
          onclick={toggle}
        >
          <span
            class={[
              "block bg-[url(/web-gallery/v2/images/subnavi-arrows.png)] bg-no-repeat pr-3",
              open ? "bg-position-[100%_-20px]" : "bg-position-[100%_1px]",
            ]}>My Groups</span
          >
        </button>
        <span
          class={[
            "float-left h-8 w-[5px]",
            open && "bg-[url(/web-gallery/v2/images/quickmenu.png)] bg-position-[100%_0] bg-no-repeat",
          ]}
        ></span>
      </li>
    </ul>
    {#if open}
      <!-- Above any home item, whose layer goes up to 1000000; Holo's 99 let items cover the menu. -->
      <div class="absolute top-8 left-0 z-[1000001] w-[220px]" role="region" aria-label="My Groups">
        <div class="h-1 bg-[url(/web-gallery/v2/images/quickmenu_top.png)] bg-no-repeat text-[1px]">
          <div class="ml-px h-px bg-white" style={`width: ${tabWidth - 2}px`}></div>
        </div>
        <div class="bg-[url(/web-gallery/v2/images/quickmenu.png)] bg-bottom-left bg-no-repeat px-px pt-1.5 pb-2.5">
          <div class="max-h-[460px] overflow-auto text-left">
            {#if groups === null}
              <div class="py-1 text-center"><Spinner /></div>
            {:else}
              <ul>
                {#each groups as group, i (group.id)}
                  <li class={["flow-root px-3.5 pt-1 pb-[3px]", i % 2 === 0 && "bg-taupe-100"]}>
                    {#if group.favourite}<div class={[icon, "bg-position-[100%_-433px]"]} title="Favourite"></div>{/if}
                    {#if group.admin}<div class={[icon, "bg-position-[100%_-528px]"]} title="Admin"></div>{/if}
                    {#if group.owner}<div class={[icon, "bg-position-[100%_-480px]"]} title="Owner"></div>{/if}
                    <a class="float-left overflow-hidden text-ellipsis text-olive-800 no-underline hover:underline" href={`/groups/${group.id}`}
                      >{group.name}</a
                    >
                  </li>
                {:else}
                  <li class="flow-root px-3.5 pt-1 pb-[3px]">You don't have any groups yet</li>
                {/each}
              </ul>
              <p class="m-0 border-t border-dashed border-neutral-500 px-3.5 pt-1 pb-[3px]">
                <button
                  type="button"
                  class="cursor-pointer bg-[url(/web-gallery/v2/images/myhabbo_icons.png)] bg-position-[100%_-236px] bg-no-repeat pr-[21px] pb-0.5 underline"
                  onclick={() => (buying = true)}>Create a group</button
                >
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
  <GroupPurchase bind:open={buying} bind:limits />
{/if}
