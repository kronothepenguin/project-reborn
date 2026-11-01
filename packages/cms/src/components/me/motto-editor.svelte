<script lang="ts">
  import { Spinner } from "@project-reborn/components";
  import { onMount, tick } from "svelte";

  // The page shows the motto without JavaScript, in the element named source,
  // and this takes over from it. Islands get no [[ ]] values, so the motto comes
  // from that element's data-motto.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  let motto = $state("");
  let draft = $state("");
  let mode = $state<"reading" | "editing" | "saving">("reading");
  let field = $state<HTMLInputElement>();

  onMount(() => {
    const element = document.getElementById(source) as HTMLElement;
    motto = element.dataset.motto ?? "";
    element.hidden = true;
  });

  async function edit() {
    draft = motto;
    mode = "editing";
    await tick();
    field?.focus();
    field?.select();
  }

  async function save() {
    if (draft === motto) {
      mode = "reading";
      return;
    }
    mode = "saving";
    try {
      const response = await fetch("/me/motto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ motto: draft }),
      });
      if (response.ok) {
        motto = (await response.json()).motto;
      }
    } finally {
      mode = "reading";
    }
  }

  function key(event: KeyboardEvent) {
    if (event.key === "Enter") {
      save();
    } else if (event.key === "Escape") {
      mode = "reading";
    }
  }
</script>

{#if mode === "editing"}
  <input
    bind:this={field}
    bind:value={draft}
    type="text"
    name="motto"
    onkeydown={key}
    class="w-full border border-white bg-neutral-300 px-0.5 text-black"
  />
  <button
    type="button"
    onclick={() => (mode = "reading")}
    class="absolute top-full right-2 cursor-pointer text-[9px] text-white underline"
  >
    Cancel
  </button>
{:else if mode === "saving"}
  <span class="flex h-full items-center justify-end pr-5"><Spinner /></span>
{:else}
  <button
    type="button"
    title="Click to enter your motto/ status"
    onclick={edit}
    class="w-full cursor-pointer truncate text-left text-mist-600"
  >
    {motto || "Click here to enter your motto"}
  </button>
{/if}
