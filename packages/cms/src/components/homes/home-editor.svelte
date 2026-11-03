<script lang="ts">
  import { Button, Icon } from "@project-reborn/components";
  import { onMount } from "svelte";
  import icons from "../../assets/myhabbo_icons.png";
  import HomeStoreDialog, { type Placed } from "./home-store-dialog.svelte";

  // Holo's edit mode: the page draws the playground and this enhances its items,
  // as homeedit.js did. Islands get no [[ ]] values, so the home, the address to
  // go back to and the skins this user may pick come from the element named
  // config.
  interface Props {
    config: string;
  }

  type Kind = "sticker" | "stickie" | "widget";

  interface Chosen {
    element: HTMLElement;
    kind: Kind;
    id: number;
    top: number;
    left: number;
  }

  let { config }: Props = $props();

  let home = $state(0);
  let noteMax = $state(500);
  let shortName = $state("");
  let view = $state("/");
  let skins = $state<{ value: string; label: string }[]>([]);
  let chosen = $state<Chosen | null>(null);
  let skin = $state("");
  let saving = $state(false);
  let dialog = $state<"inventory" | "webstore" | null>(null);
  let failure = $state("");
  let playground: HTMLElement;

  onMount(() => {
    const element = document.getElementById(config) as HTMLElement;
    home = Number(element.dataset.home);
    noteMax = Number(element.dataset.noteMax);
    shortName = element.dataset.shortName ?? "";
    view = element.dataset.view ?? "/";
    skins = [...element.querySelectorAll("option")].map((option) => ({
      value: option.value,
      label: option.textContent ?? option.value,
    }));
    playground = document.getElementById("playground") as HTMLElement;
    for (const item of playground.querySelectorAll<HTMLElement>(".movable")) {
      enhance(item);
    }
    document.addEventListener("click", close);
  });

  function kindOf(item: HTMLElement): Kind {
    if (item.classList.contains("stickie")) return "stickie";
    if (item.classList.contains("widget")) return "widget";
    return "sticker";
  }

  function idOf(item: HTMLElement) {
    return Number(item.id.substring(item.id.indexOf("-") + 1));
  }

  function zOf(item: HTMLElement) {
    return Number.parseInt(item.style.zIndex || "0", 10);
  }

  function movables() {
    return [...playground.querySelectorAll<HTMLElement>(".movable")];
  }

  // getNextZIndex: one above everything on the playground.
  function nextZ() {
    return Math.max(0, ...movables().map(zOf)) + 1;
  }

  function at(element: HTMLElement, item: Placed) {
    element.id = `${item.kind === "note" ? "stickie" : item.kind}-${item.id}`;
    element.style.left = `${item.x}px`;
    element.style.top = `${item.y}px`;
    element.style.zIndex = String(item.z);
  }

  // place draws what the dialog placed as the page draws it, and enhances it.
  function place(items: Placed[]) {
    for (const item of items) {
      const element = document.createElement("div");
      at(element, item);
      if (item.kind === "sticker") {
        element.className = "movable sticker absolute";
        const art = document.createElement("img");
        art.src = item.image ?? "";
        art.alt = "";
        element.append(art);
      } else {
        element.className = "movable stickie absolute";
        element.dataset.noteSkin = item.skin;
        element.innerHTML = `<div data-note-skin="${item.skin}"><div class="stickie-header"><h3></h3><div class="clear-both"></div></div><div class="stickie-body"><div class="stickie-content"><div class="stickie-markup"></div><div class="stickie-footer"></div></div></div></div>`;
        (element.querySelector(".stickie-markup") as HTMLElement).innerHTML = item.html ?? "";
      }
      playground.append(element);
      enhance(element);
    }
  }

  function background(id: number, image: string) {
    const holder = document.getElementById("mypage-bg") as HTMLElement;
    holder.dataset.background = String(id);
    holder.style.backgroundImage = `url('${image}')`;
  }

  // bringElementOnTop: the items above it move one down, and it goes above them all.
  function bringOnTop(item: HTMLElement) {
    const own = zOf(item);
    let top = 0;
    for (const other of movables()) {
      const z = zOf(other);
      if (z > own) other.style.zIndex = String(z - 1);
      if (z >= top) top = z;
    }
    item.style.zIndex = String(top + 1);
  }

  function outside(item: HTMLElement) {
    return (
      item.offsetLeft < 0 ||
      item.offsetTop < 0 ||
      item.offsetLeft + item.offsetWidth > playground.clientWidth ||
      item.offsetTop + item.offsetHeight > playground.clientHeight
    );
  }

  function enhance(item: HTMLElement) {
    const kind = kindOf(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "edit-button size-4 cursor-pointer bg-no-repeat";
    button.style.backgroundImage = `url(${icons.src})`;
    button.style.backgroundPosition = "0 -284px";
    button.setAttribute("aria-label", "Edit");
    button.addEventListener("click", (event) => open(event, item, button));
    if (kind === "sticker") {
      button.classList.add("absolute", "top-0", "right-0");
      item.append(button);
    } else {
      item.querySelector("h3")?.prepend(button);
    }

    const handle = kind === "widget" ? (item.querySelector(".widget-corner") as HTMLElement) : item;
    handle.addEventListener("pointerdown", (event) => drag(event, item));
  }

  function drag(event: PointerEvent, item: HTMLElement) {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".edit-button")) return;
    event.preventDefault();
    const start = { left: item.offsetLeft, top: item.offsetTop, x: event.clientX, y: event.clientY };
    let moved = false;
    item.setPointerCapture(event.pointerId);
    const previousZ = item.style.zIndex;
    item.style.zIndex = "9000";

    const move = (e: PointerEvent) => {
      moved = true;
      document.body.classList.add("dragging");
      item.style.left = `${start.left + e.clientX - start.x}px`;
      item.style.top = `${start.top + e.clientY - start.y}px`;
    };
    const up = () => {
      item.removeEventListener("pointermove", move);
      item.removeEventListener("pointerup", up);
      item.removeEventListener("pointercancel", up);
      item.style.zIndex = previousZ;
      document.body.classList.remove("dragging");
      if (moved && outside(item)) {
        item.style.left = `${start.left}px`;
        item.style.top = `${start.top}px`;
        return;
      }
      bringOnTop(item);
    };
    item.addEventListener("pointermove", move);
    item.addEventListener("pointerup", up);
    item.addEventListener("pointercancel", up);
  }

  function open(event: MouseEvent, item: HTMLElement, button: HTMLElement) {
    event.stopPropagation();
    const offset = button.getBoundingClientRect();
    const kind = kindOf(item);
    const skinned = item.querySelector<HTMLElement>("[data-widget-skin], [data-note-skin]");
    skin = skinned?.dataset.widgetSkin ?? skinned?.dataset.noteSkin ?? "";
    chosen = {
      element: item,
      kind,
      id: idOf(item),
      top: offset.top + window.scrollY - 5,
      left: offset.left + window.scrollX - 5,
    };
  }

  function close() {
    chosen = null;
  }

  async function post(path: string, body: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return response;
  }

  async function changeSkin() {
    if (!chosen) return;
    const { element, id } = chosen;
    const response = await post(`/homes/${home}/items/${id}/skin`, { skin });
    if (response.ok) {
      for (const skinned of [element, ...element.querySelectorAll<HTMLElement>("[data-widget-skin], [data-note-skin]")]) {
        if (skinned.dataset.widgetSkin !== undefined) skinned.dataset.widgetSkin = skin;
        if (skinned.dataset.noteSkin !== undefined) skinned.dataset.noteSkin = skin;
      }
    } else {
      failure = (await response.json()).error ?? "";
    }
    close();
  }

  async function remove() {
    if (!chosen) return;
    const { element, id } = chosen;
    const response = await post(`/homes/${home}/items/${id}/delete`, {});
    if (response.ok) {
      element.remove();
    } else {
      failure = (await response.json()).error ?? "";
    }
    close();
  }

  async function save() {
    saving = true;
    const items = movables().map((item) => ({
      id: idOf(item),
      x: item.offsetLeft,
      y: item.offsetTop,
      z: zOf(item),
    }));
    const background = Number(document.getElementById("mypage-bg")?.dataset.background ?? 0);
    const response = await post(`/homes/${home}/layout`, { items, background });
    if (response.ok) {
      window.location.href = view;
      return;
    }
    saving = false;
    failure = (await response.json()).error ?? "";
  }
</script>

<div class="flex items-center justify-between px-2.5 pb-[3px]">
  <ul class="flex gap-[5px]">
    <li><button type="button" class="cursor-pointer underline" onclick={() => (dialog = "inventory")}>Inventory</button></li>
    <li><button type="button" class="cursor-pointer underline" onclick={() => (dialog = "webstore")}>Webstore</button></li>
  </ul>
  <div class="flex gap-1">
    <Button variant="red" size="compact" href={view}>
      <span class="flex items-center gap-1"><Icon variant="cancel" />Cancel</span>
    </Button>
    <Button variant="green" size="compact" disabled={saving} onclick={save}>
      <span class="flex items-center gap-1"><Icon variant="save" />Save</span>
    </Button>
  </div>
</div>

{#if dialog}
  <HomeStoreDialog
    {home}
    {noteMax}
    {shortName}
    {nextZ}
    bind:tab={dialog}
    onclose={() => (dialog = null)}
    onplace={place}
    onbackground={background}
  />
{/if}

{#if failure}
  <div class="mx-2.5 mb-[3px] rounded border border-red-600 bg-white p-1 text-red-600" role="alert">{failure}</div>
{/if}

{#if chosen}
  <div
    id="edit-menu"
    class="absolute z-[9000] w-[193px] rounded border border-black bg-white p-1.5 text-[11px]"
    style={`top: ${chosen.top}px; left: ${chosen.left}px`}
    role="dialog"
    aria-label="Edit"
    tabindex="-1"
    onclick={(event) => event.stopPropagation()}
    onkeydown={(event) => event.key === "Escape" && close()}
  >
    <div class="mb-1.5 flex items-center border-b border-dashed border-black pb-[3px]">
      <h3 class="flex-1 text-center text-[10px] font-bold">Edit</h3>
      <button type="button" class="cursor-pointer px-1" aria-label="Close" onclick={close}>×</button>
    </div>
    {#if chosen.kind !== "sticker"}
      <select class="mb-[3px] w-full border border-neutral-500" aria-label="Skin" bind:value={skin} onchange={changeSkin}>
        {#each skins as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {/if}
    {#if chosen.kind === "stickie"}
      <p class="pt-[1em]">Warning! If you click 'Remove', the note will be permanently deleted.</p>
    {/if}
    {#if !chosen.element.classList.contains("profile-widget")}
      <input type="button" class="w-full cursor-pointer border border-black bg-mauve-300" value="Remove" onclick={remove} />
    {/if}
  </div>
{/if}
