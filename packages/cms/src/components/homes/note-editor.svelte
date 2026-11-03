<script lang="ts">
  import { Button } from "@project-reborn/components";
  import type { Placed } from "./home-store-dialog.svelte";

  // store.php's note editor: write, look at it as it will show, then add it to the
  // page. Its skins are the six of Holo's editor, and the text cannot change once
  // the note is on the page.
  interface Props {
    home: number;
    item: number;
    max: number;
    oncancel: () => void;
    onplace: (placed: Placed[]) => void;
  }

  let { home, item, max, oncancel, onplace }: Props = $props();

  const skins = [
    ["defaultskin", "Default"],
    ["goldenskin", "Golden"],
    ["metalskin", "Metal"],
    ["notepadskin", "Notepad"],
    ["speechbubbleskin", "Speech Bubble"],
    ["noteitskin", "Stickie Note"],
  ] as const;

  const colors = [
    ["red", "Red"],
    ["orange", "Orange"],
    ["yellow", "Yellow"],
    ["green", "Green"],
    ["cyan", "Cyan"],
    ["blue", "Blue"],
    ["gray", "Grey"],
    ["black", "Black"],
  ] as const;

  let skin = $state<string>("defaultskin");
  let text = $state("");
  let preview = $state<string | null>(null);
  let failure = $state("");
  let field = $state<HTMLTextAreaElement>();

  const left = $derived(max - [...text].length);

  function wrap(open: string, close: string) {
    if (!field) return;
    const { selectionStart: start, selectionEnd: end } = field;
    text = text.slice(0, start) + open + text.slice(start, end) + close + text.slice(end);
  }

  async function post(path: string, body: object) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function look() {
    const response = await post("/bbcode/preview", { text });
    preview = (await response.json()).html;
  }

  async function place() {
    const response = await post(`/homes/${home}/items`, { kind: "note", item, skin, text });
    const answer = await response.json();
    if (!response.ok) {
      failure = answer.error;
      return;
    }
    onplace(answer);
  }
</script>

<div
  class="absolute top-16 left-1/2 z-[9002] w-[420px] -translate-x-1/2 rounded border-2 border-black bg-white p-2 text-[11px]"
  role="dialog"
  aria-label="Notes"
>
  {#if failure}
    <p class="mb-1 text-red-600" role="alert">{failure}</p>
  {/if}
  {#if preview === null}
    <div class="text-right" aria-live="polite">{left}</div>
    <p>
      <select class="border border-neutral-500" aria-label="Note skin" bind:value={skin}>
        {#each skins as [value, label] (value)}
          <option {value}>{label}</option>
        {/each}
      </select>
    </p>
    <p class="my-1 text-red-600">Note! This text is not editable after you've placed the note on your page.</p>
    <div class="mb-1 flex flex-wrap gap-1">
      <button type="button" class="cursor-pointer border px-1 font-bold" onclick={() => wrap("[b]", "[/b]")}>B</button>
      <button type="button" class="cursor-pointer border px-1 italic" onclick={() => wrap("[i]", "[/i]")}>I</button>
      <button type="button" class="cursor-pointer border px-1 underline" onclick={() => wrap("[u]", "[/u]")}>U</button>
      <button type="button" class="cursor-pointer border px-1 line-through" onclick={() => wrap("[s]", "[/s]")}>S</button>
      <button type="button" class="cursor-pointer border px-1" onclick={() => wrap("[quote]", "[/quote]")}>Quote</button>
      <button type="button" class="cursor-pointer border px-1" onclick={() => wrap("[code]", "[/code]")}>Code</button>
      <button type="button" class="cursor-pointer border px-1" onclick={() => wrap("[url=http://]", "[/url]")}>Link</button>
      <select
        class="border"
        aria-label="Colours"
        onchange={(event) => {
          const color = event.currentTarget.value;
          if (color) wrap(`[color=${color}]`, "[/color]");
          event.currentTarget.value = "";
        }}
      >
        <option value="">Colours</option>
        {#each colors as [value, label] (value)}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>
    <textarea
      class="w-full border border-neutral-500 p-1"
      rows="7"
      maxlength={max}
      aria-label="Note text"
      bind:this={field}
      bind:value={text}
    ></textarea>
    <div class="mt-1 flex gap-1">
      <Button size="compact" onclick={oncancel}>Cancel</Button>
      <Button size="compact" onclick={look}>Continue</Button>
    </div>
  {:else}
    <div class="stickie relative" data-note-skin={skin}>
      <div data-note-skin={skin}>
        <div class="stickie-header"><h3></h3></div>
        <div class="stickie-body">
          <div class="stickie-content">
            <div class="stickie-markup">{@html preview}</div>
            <div class="stickie-footer"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-1 flex gap-1">
      <Button size="compact" onclick={() => (preview = null)}>Edit</Button>
      <Button size="compact" onclick={place}>Add to page</Button>
    </div>
  {/if}
</div>
