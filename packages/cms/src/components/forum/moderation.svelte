<script lang="ts">
  import { Button, Card, Dialog, Notice, Spinner } from "@project-reborn/components";
  import { onMount } from "svelte";
  import { go, post } from "./forum";

  // viewthread.php's Moderation Tools. The link opens opentopicsettings.php's
  // dialog on the thread as it is now; Save swaps the post list for Holo's answer,
  // and Delete asks confirm_delete_topic.php's question first.
  const unknown = "An unknown error occurred. Please try again in a couple of minutes.";

  let thread = "";
  let settings = $state(false);
  let loading = $state(false);
  let unreadable = $state(false);
  let title = $state("");
  let closed = $state(false);
  let sticky = $state(false);
  let error = $state("");
  let confirming = $state(false);
  let deleting = $state(false);
  let failed = $state(false);
  let answer = $state<{ message: string; location: string } | null>(null);

  onMount(() => {
    thread = (document.getElementById("forum-viewer") as HTMLElement).dataset.thread ?? "";
    const link = document.getElementById("edit-topic-settings");
    link?.addEventListener("click", open);
    return () => link?.removeEventListener("click", open);
  });

  async function open() {
    error = "";
    unreadable = false;
    loading = true;
    settings = true;
    const response = await fetch(`/forum/threads/${thread}/settings`, { headers: { Accept: "application/json" } }).catch(() => null);
    const current = response?.ok
      ? ((await response.json().catch(() => null)) as { title: string; closed: boolean; sticky: boolean } | null)
      : null;
    if (current) {
      title = current.title;
      closed = current.closed;
      sticky = current.sticky;
    } else {
      unreadable = true;
    }
    loading = false;
  }

  // Holo closed the dialog as it sent the form, and put the server's answer where
  // the post list was.
  async function save() {
    if (title.trim() === "") {
      error = "Topic title may not be empty";
      return;
    }
    settings = false;
    const result = await post(`/forum/threads/${thread}/settings`, { title, closed, sticky }).catch(() => ({
      ok: false,
      error: "",
      location: "",
      message: "",
    }));
    if (result.ok && result.location) {
      (document.getElementById("group-postlist-container") as HTMLElement).hidden = true;
      answer = { message: result.message ?? "", location: result.location };
      return;
    }
    error = result.error || unknown;
    settings = true;
  }

  function askToDelete() {
    settings = false;
    failed = false;
    confirming = true;
  }

  async function proceed() {
    deleting = true;
    const result = await post(`/forum/threads/${thread}/delete`, {}).catch(() => ({ ok: false, location: "" }));
    if (result.ok) {
      go(result.location || "/forum");
      return;
    }
    deleting = false;
    failed = true;
  }
</script>

{#if answer}
  <div class="pt-[26px] pb-[39px] text-center">
    <b>{answer.message}</b><br /><a class="text-orange-500 underline" href={answer.location}>Proceed</a>
  </div>
{/if}

{#snippet settingsHeader()}
  <span class="relative block">
    Moderation Tools
    <button type="button" class="absolute top-0 right-0 cursor-pointer px-1" aria-label="Close" onclick={() => (settings = false)}
      >X</button
    >
  </span>
{/snippet}

<Dialog open={settings} label="Moderation Tools" class="m-auto w-[398px] bg-transparent backdrop:bg-black/40" onclose={() => (settings = false)}>
  <Card color="orange" header={settingsHeader}>
    <div class="text-[11px]">
      {#if loading}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if unreadable}
        <p class="mb-2">{unknown}</p>
        <p><Button onclick={() => (settings = false)}>OK</Button></p>
      {:else}
        <div id="topic-settings-form">
          <div class="my-[5px]"><label for="topic_name">Topic: (max 30 characters)</label></div>
          <div class="my-[5px]">
            <input id="topic_name" type="text" size="40" maxlength="30" class="border border-neutral-500 bg-white px-1" bind:value={title} />
          </div>
          {#if error}<div class="mb-[5px]"><Notice variant="red" role="alert">{error}</Notice></div>{/if}
          <div class="flow-root">
            <div class="float-left">Type:</div>
            <div class="float-left">
              <label><input type="radio" name="topic_type" id="topic_open" value={false} bind:group={closed} /> Open</label><br />
              <label><input type="radio" name="topic_sticky" id="topic_normal" value={false} bind:group={sticky} /> Normal</label>
            </div>
            <div class="float-left">
              <label><input type="radio" name="topic_type" id="topic_closed" value={true} bind:group={closed} /> Closed</label><br />
              <label><input type="radio" name="topic_sticky" id="topic_sticky" value={true} bind:group={sticky} /> Sticky topic</label>
            </div>
          </div>
          <div class="my-[5px] flex gap-1 pt-[26px]">
            <Button onclick={() => (settings = false)}>Cancel</Button>
            <Button onclick={askToDelete}>Delete</Button>
            <Button onclick={save}>Save</Button>
          </div>
        </div>
      {/if}
    </div>
  </Card>
</Dialog>

{#snippet confirmHeader()}Moderation Tools{/snippet}

<Dialog
  open={confirming}
  label="Moderation Tools"
  class="m-auto w-[398px] bg-transparent backdrop:bg-black/40"
  onclose={() => {
    if (!deleting) confirming = false;
  }}
>
  <Card color="orange" header={confirmHeader}>
    <div class="text-[11px]">
      {#if deleting}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if failed}
        <p class="mb-2">{unknown}</p>
        <p><Button onclick={() => (confirming = false)}>OK</Button></p>
      {:else}
        <p class="mb-2">You are about to delete a compelete topic. Are you sure?</p>
        <p class="flex gap-1">
          <Button onclick={() => (confirming = false)}>Cancel</Button>
          <Button onclick={proceed}>Proceed</Button>
        </p>
      {/if}
    </div>
  </Card>
</Dialog>
