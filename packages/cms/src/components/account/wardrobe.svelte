<script lang="ts">
  import { Bubble, Button, Card, Dialog } from "@project-reborn/components";
  import { onMount } from "svelte";
  import greenArrow from "../../assets/account/arrow_green.png";
  import redArrow from "../../assets/account/arrow_red.png";
  import slotBackground from "../../assets/account/slot_bg.png";

  // The wardrobe of Holo's settings.js. source is the hidden list the page fills
  // with the number of slots and the outfits in them, and figureInput and
  // genderInput hold the editor's look.
  interface Props {
    source: string;
    figureInput: string;
    genderInput: string;
  }

  let { source, figureInput, genderInput }: Props = $props();

  type Outfit = { figure: string; gender: string; picture: string };
  type Look = { slot: number; figure: string; gender: string };

  let slots = $state<(Outfit | null)[]>([]);
  let tip = $state(false);
  let replacing = $state<Look | null>(null);

  onMount(() => {
    const list = document.getElementById(source) as HTMLElement;
    const found: (Outfit | null)[] = Array.from({ length: Number(list.dataset.slots) }, () => null);
    for (const li of list.querySelectorAll<HTMLElement>("li")) {
      found[Number(li.dataset.slot) - 1] = {
        figure: li.dataset.figure ?? "",
        gender: li.dataset.gender ?? "",
        picture: li.dataset.picture ?? "",
      };
    }
    slots = found;
  });

  function input(id: string) {
    return document.getElementById(id) as HTMLInputElement;
  }

  function store(slot: number) {
    const look = { slot, figure: input(figureInput).value, gender: input(genderInput).value };
    if (slots[slot - 1]) {
      replacing = look;
    } else {
      save(look);
    }
  }

  function replace() {
    const look = replacing;
    replacing = null;
    if (look) save(look);
  }

  // The slot takes the outfit once the server keeps it. Holo took it before the
  // answer, so a refused outfit could still be dressed in.
  async function save({ slot, figure, gender }: Look) {
    try {
      const response = await fetch(`/account/looks/wardrobe/${slot}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ figure, gender }),
      });
      if (response.ok) {
        const { picture } = (await response.json()) as { picture: string };
        slots[slot - 1] = { figure, gender, picture };
        return;
      }
    } catch {
      // The alert below covers a request that never came back.
    }
    alert("Error! This outfit cannot be saved.");
  }

  function dress(slot: number) {
    const outfit = slots[slot - 1];
    if (outfit && input(figureInput).value !== outfit.figure) {
      const look = { figure: outfit.figure, gender: outfit.gender };
      document.getElementById("editor-container")?.dispatchEvent(new CustomEvent("restart", { detail: look }));
    }
  }

  const arrow = "ml-0.5 block h-[27px] w-[19px] cursor-pointer bg-center bg-no-repeat";
</script>

{#snippet title()}Replace?{/snippet}

<div
  id="settings-wardrobe"
  role="group"
  aria-label="Wardrobe"
  class="relative mt-[46px] w-[67px]"
  onmouseenter={() => (tip = true)}
  onmouseleave={() => (tip = false)}
  onfocusin={() => (tip = true)}
  onfocusout={() => (tip = false)}
>
  {#if tip}
    <!-- Holo's bubble stood 585 pixels from the content's left, which is 95 left of the slots, and ended 6 above them. -->
    <div id="wardrobe-instructions" role="tooltip" class="pointer-events-none absolute bottom-[calc(100%+17px)] left-[-95px] z-10">
      <Bubble>
        Press red arrows to save up to {slots.length} outfits to your wardrobe. Press green arrow to select an outfit and
        save changes to take it into use.
      </Bubble>
    </div>
  {/if}
  <ol id="wardrobe-slots">
    {#each slots as outfit, i (i)}
      <li class="h-[66px] w-[67px] bg-no-repeat" style:background-image="url({slotBackground.src})">
        <p
          id="wardrobe-slot-{i + 1}"
          class="flow-root h-[62px] w-[67px] bg-position-[27px_0] bg-no-repeat"
          style:background-image={outfit ? `url(${JSON.stringify(outfit.picture)})` : undefined}
        >
          <button
            id="wardrobe-store-{i + 1}"
            type="button"
            class="{arrow} mt-0.5"
            style:background-image="url({redArrow.src})"
            aria-label="Save outfit {i + 1}"
            onclick={() => store(i + 1)}
          ></button>
          {#if outfit}
            <button
              id="wardrobe-dress-{i + 1}"
              type="button"
              class="{arrow} mt-[3px]"
              style:background-image="url({greenArrow.src})"
              aria-label="Select outfit {i + 1}"
              onclick={() => dress(i + 1)}
            ></button>
          {/if}
        </p>
      </li>
    {/each}
  </ol>
</div>

<Dialog
  open={replacing !== null}
  label="Replace?"
  class="m-auto w-[398px] bg-transparent backdrop:bg-black/40"
  onclose={() => (replacing = null)}
>
  <Card color="orange" header={title}>
    <div class="text-[11px]">
      <p class="mb-2">Are you sure you want to replace the stored outfit with the new one?</p>
      <p class="flex gap-1">
        <Button id="wardrobe-replace-cancel" onclick={() => (replacing = null)}>Cancel</Button>
        <Button id="wardrobe-replace-ok" onclick={replace}>OK</Button>
      </p>
    </div>
  </Card>
</Dialog>
