<script lang="ts">
  import { Button } from "@project-reborn/components";
  import NoteEditor from "./note-editor.svelte";

  // Holo's Inventory and Webstore dialog of the edit mode, from store.php and
  // myhabbo-store.js. It answers what was placed through onplace, and the
  // background chosen through onbackground, which Save keeps.
  interface Props {
    home: number;
    tab: "inventory" | "webstore";
    noteMax: number;
    shortName: string;
    nextZ: () => number;
    onclose: () => void;
    onplace: (items: Placed[]) => void;
    onbackground: (id: number, image: string) => void;
  }

  export interface Placed {
    id: number;
    kind: string;
    x: number;
    y: number;
    z: number;
    image?: string;
    skin?: string;
    html?: string;
  }

  interface Category {
    id: number;
    name: string;
    staffOnly: boolean;
    section: "stickers" | "backgrounds" | "notes";
  }

  interface Item {
    id: number;
    kind: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }

  type Held = { id: number; name: string; image: string; quantity: number };
  type Inventory = Record<"stickers" | "backgrounds" | "notes" | "widgets", Held[]>;

  let { home, tab = $bindable(), noteMax, shortName, nextZ, onclose, onplace, onbackground }: Props = $props();

  let credits = $state(0);
  let categories = $state<Category[]>([]);
  let section = $state<Category["section"]>("stickers");
  let category = $state<number | null>(null);
  let items = $state<Item[]>([]);
  let selected = $state<Item | null>(null);
  let confirming = $state(false);
  let message = $state("");

  let inventory = $state<Inventory>({ stickers: [], backgrounds: [], notes: [], widgets: [] });
  let shelf = $state<keyof Inventory>("stickers");
  let held = $state<Held | null>(null);
  let writing = $state(false);

  const sections: { id: Category["section"]; label: string }[] = [
    { id: "stickers", label: "Stickers" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "notes", label: "Notes" },
  ];

  const shelves: { id: keyof Inventory; label: string }[] = [
    { id: "stickers", label: "Stickers" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "widgets", label: "Widgets" },
    { id: "notes", label: "Notes" },
  ];

  async function getJSON<T>(path: string): Promise<T> {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    return response.json();
  }

  async function loadStore() {
    const view = await getJSON<{ credits: number; categories: Category[] }>("/home-store");
    credits = view.credits;
    categories = view.categories;
    const first = categories.find((c) => c.section === section);
    if (first) await openCategory(first.id);
  }

  async function openCategory(id: number) {
    category = id;
    selected = null;
    items = await getJSON<Item[]>(`/home-store/categories/${id}`);
  }

  async function openSection(id: Category["section"]) {
    section = id;
    const first = categories.find((c) => c.section === id);
    if (first) await openCategory(first.id);
  }

  async function loadInventory() {
    inventory = await getJSON<Inventory>("/me/inventory");
    held = null;
  }

  $effect(() => {
    if (tab === "webstore") loadStore();
    else loadInventory();
  });

  async function post(path: string, body: object) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function buy() {
    if (!selected) return;
    const response = await post(`/home-store/items/${selected.id}/purchase`, {});
    const answer = await response.json();
    confirming = false;
    if (response.ok) {
      credits = answer.credits;
      message = "";
    } else {
      message = answer.error;
    }
  }

  async function place(all: boolean) {
    if (!held) return;
    const response = await post(`/homes/${home}/items`, { kind: "sticker", item: held.id, all, z: nextZ() });
    const answer = await response.json();
    if (!response.ok) {
      message = answer.error;
      return;
    }
    onplace(answer);
    onclose();
  }

  function useBackground() {
    if (!held) return;
    onbackground(held.id, held.image);
    onclose();
  }
</script>

<div
  class="absolute top-10 left-1/2 z-[9001] w-[600px] -translate-x-1/2 rounded border-2 border-black bg-white text-[11px]"
  role="dialog"
  aria-label={tab === "webstore" ? "Webstore" : "Inventory"}
>
  <div class="flex border-b-2 border-black bg-neutral-500 text-white">
    {#each [["inventory", "Inventory"], ["webstore", "Webstore"]] as const as [id, label] (id)}
      <button
        type="button"
        class={["cursor-pointer px-3 py-1 font-bold", tab === id ? "bg-white text-black" : ""]}
        onclick={() => (tab = id)}
      >
        {label}
      </button>
    {/each}
    <button type="button" class="ml-auto cursor-pointer px-3" aria-label="Close" onclick={onclose}>×</button>
  </div>

  {#if message}
    <div class="m-2 rounded border border-red-600 p-1 text-red-600" role="alert">
      <p>{message}</p>
      <Button size="compact" onclick={() => (message = "")}>OK</Button>
    </div>
  {/if}

  {#if tab === "webstore"}
    <div class="flex gap-2 p-2">
      <div class="w-[150px]">
        <h4 class="font-bold">Categories:</h4>
        <ul>
          {#each sections as main (main.id)}
            <li>
              <button type="button" class={["cursor-pointer font-bold", section === main.id && "underline"]} onclick={() => openSection(main.id)}>
                {main.label}
              </button>
              {#if main.id === "stickers" && section === "stickers"}
                <ul class="pl-2">
                  {#each categories.filter((c) => c.section === "stickers") as sub (sub.id)}
                    <li>
                      <button
                        type="button"
                        class={["cursor-pointer", category === sub.id && "font-bold", sub.staffOnly && "font-bold text-red-600"]}
                        onclick={() => openCategory(sub.id)}
                      >
                        {sub.staffOnly ? `${shortName} ${sub.name}` : sub.name}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
      <div class="flex-1">
        <p>Select an item by clicking it</p>
        <ul class="flex max-h-[260px] flex-wrap gap-1 overflow-y-auto">
          {#each items as item (item.id)}
            <li>
              <button
                type="button"
                class={["flex size-[56px] cursor-pointer items-center justify-center border", selected?.id === item.id ? "border-black" : "border-neutral-300"]}
                title={item.name}
                onclick={() => (selected = item)}
              >
                <img class="max-h-[52px] max-w-[52px]" src={item.image} alt={item.name} />
              </button>
            </li>
          {/each}
        </ul>
      </div>
      <div class="w-[160px]">
        {#if selected}
          <h4 class="font-bold">{selected.name}</h4>
          <div class="my-1 flex h-[100px] items-center justify-center bg-neutral-100">
            <img class="max-h-[96px] max-w-[156px]" src={selected.image} alt="" />
          </div>
          <p>Price: <b>{selected.price} Credits</b></p>
          <p>You have:<br /><b>{credits} Credits</b></p>
          {#if credits < selected.price}
            <p class="text-red-600">You don't have enough Credits to buy this item.</p>
            <a class="underline" href="/credits" target="_blank">Get Credits</a>
          {/if}
          <div class="mt-1">
            <Button size="compact" disabled={credits < selected.price} onclick={() => (confirming = true)}>Buy</Button>
          </div>
          {#if confirming}
            <div class="mt-1 rounded border border-black p-1">
              <p>Are you sure you want to buy <b>{selected.name}</b>? This purchase will cost you <b>{selected.price}</b> credits!</p>
              <div class="mt-1 flex gap-1">
                <Button size="compact" onclick={() => (confirming = false)}>Cancel</Button>
                <Button size="compact" onclick={buy}>Continue</Button>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex gap-2 p-2">
      <ul class="w-[150px]">
        {#each shelves as option (option.id)}
          <li>
            <button
              type="button"
              class={["cursor-pointer font-bold", shelf === option.id && "underline"]}
              onclick={() => {
                shelf = option.id;
                held = null;
              }}
            >
              {option.label}
            </button>
          </li>
        {/each}
      </ul>
      <div class="flex-1">
        <p>Click an item to select it:</p>
        <ul class="flex max-h-[260px] flex-wrap gap-1 overflow-y-auto">
          {#each inventory[shelf] as item (item.id)}
            <li>
              <button
                type="button"
                class={["relative flex size-[56px] cursor-pointer items-center justify-center border", held?.id === item.id ? "border-black" : "border-neutral-300"]}
                title={item.name}
                onclick={() => (held = item)}
              >
                <img class="max-h-[52px] max-w-[52px]" src={item.image} alt={item.name} />
                {#if item.quantity > 1}<span class="absolute right-0 bottom-0 bg-white px-0.5">x{item.quantity}</span>{/if}
              </button>
            </li>
          {/each}
        </ul>
      </div>
      <div class="w-[160px]">
        {#if held}
          <div class="my-1 flex h-[100px] items-center justify-center bg-neutral-100">
            <img class="max-h-[96px] max-w-[156px]" src={held.image} alt="" />
          </div>
          {#if shelf === "stickers"}
            <div class="flex gap-1">
              <Button size="compact" onclick={() => place(false)}>Place</Button>
              {#if held.quantity > 1}<Button size="compact" onclick={() => place(true)}>All</Button>{/if}
            </div>
          {:else if shelf === "backgrounds"}
            <Button size="compact" onclick={useBackground}>Place</Button>
          {:else if shelf === "notes"}
            <Button size="compact" onclick={() => (writing = true)}>Place</Button>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
  <div class="border-t border-neutral-300 p-1 text-right">
    <Button size="compact" onclick={onclose}>Close</Button>
  </div>
</div>

{#if writing && held}
  <NoteEditor
    {home}
    item={held.id}
    max={noteMax}
    oncancel={() => (writing = false)}
    onplace={(placed) => {
      writing = false;
      onplace(placed);
      onclose();
    }}
  />
{/if}
