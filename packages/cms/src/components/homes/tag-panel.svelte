<script lang="ts">
  import { onMount } from "svelte";
  import icons from "../../assets/myhabbo_icons.png";

  // The widget shows the tags without JavaScript, in the element named source,
  // and this takes over from it. Islands get no [[ ]] values, so the tags come
  // from its links and the panel's kind from its data-panel: own for the active
  // habbo's profile, other for anyone else's while signed in.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  const limitText =
    "You've reached the tag limit - delete one of your tags if you want to add a new one.";

  let tags = $state<string[]>([]);
  let panel = $state<"own" | "other">("other");
  let added = $state<string[]>([]);
  let draft = $state("");
  let error = $state("");

  onMount(() => {
    const element = document.getElementById(source) as HTMLElement;
    panel = element.dataset.panel === "own" ? "own" : "other";
    tags = [...element.querySelectorAll("a")].map((a) => a.textContent ?? "");
    element.hidden = true;
  });

  async function send(path: string, body: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return {
      ok: response.ok,
      answer: (await response.json()) as { tags: string[]; error?: string },
    };
  }

  async function add() {
    const { ok, answer } = await send("/me/tags", { tag: draft });
    tags = answer.tags;
    error = ok ? "" : answer.error === "limit" ? limitText : "Invalid tag";
    if (ok) draft = "";
  }

  async function remove(tag: string) {
    const { answer } = await send(`/me/tags/${encodeURIComponent(tag)}/delete`, {});
    tags = answer.tags;
    error = "";
  }

  async function borrow(tag: string) {
    const { ok, answer } = await send("/me/tags", { tag });
    if (ok) added = [...added, tag];
    error = ok ? "" : answer.error === "limit" ? limitText : "Invalid tag";
  }

  const sprite = `background-image: url(${icons.src})`;
</script>

<div class="my-[5px] border border-white p-0.5">
  {#each tags as tag (tag)}
    <span class="mr-1 inline-flex items-center gap-0.5">
      <a href={`/tags?tag=${encodeURIComponent(tag)}`}>{tag}</a>
      {#if panel === "own"}
        <button
          type="button"
          class="size-4 cursor-pointer bg-no-repeat bg-position-[0_-197px]"
          style={sprite}
          aria-label={`Remove ${tag}`}
          onclick={() => remove(tag)}
        ></button>
      {:else if !added.includes(tag)}
        <button
          type="button"
          class="size-4 cursor-pointer bg-no-repeat bg-position-[0_-236px]"
          style={sprite}
          aria-label={`Add ${tag} to my tags`}
          onclick={() => borrow(tag)}
        ></button>
      {/if}
    </span>
  {:else}
    No tags
  {/each}
</div>
{#if error}
  <div class="mt-[5px] rounded border border-red-600 bg-white p-1 text-red-600" role="alert">
    {error}
  </div>
{/if}
{#if panel === "own"}
  <form
    class="mt-[5px]"
    onsubmit={(event) => {
      event.preventDefault();
      add();
    }}
  >
    <input
      class="w-full border border-neutral-500 px-1"
      maxlength="30"
      aria-label="New tag"
      bind:value={draft}
    />
    <button
      type="submit"
      class="mt-[5px] rounded border-2 border-black bg-mauve-300 px-2 py-0.5 text-xs font-bold"
    >
      Add tag
    </button>
  </form>
{/if}
