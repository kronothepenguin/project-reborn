<script lang="ts">
  import { BBCodeEditor, Button } from "@project-reborn/components";
  import type { Placed } from "./home-store-dialog.svelte";

  // store.php's note editor: write, look at it as it will show, then add it to the
  // page. Its skins are the six of Holo's editor, the text is written in the
  // BBCode editor (0092), and it cannot change once the note is on the page.
  interface Props {
    home: number;
    item: number;
    max: number;
    smilies: boolean;
    oncancel: () => void;
    onplace: (placed: Placed[]) => void;
  }

  let { home, item, max, smilies, oncancel, onplace }: Props = $props();

  const skins = [
    ["defaultskin", "Default"],
    ["goldenskin", "Golden"],
    ["metalskin", "Metal"],
    ["notepadskin", "Notepad"],
    ["speechbubbleskin", "Speech Bubble"],
    ["noteitskin", "Stickie Note"],
  ] as const;

  let skin = $state<string>("defaultskin");
  let text = $state("");
  let preview = $state<string | null>(null);
  let failure = $state("");

  const left = $derived(max - [...text].length);

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
    <BBCodeEditor bind:value={text} {smilies} label="Note text" rows={7} maxLength={max} />
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
