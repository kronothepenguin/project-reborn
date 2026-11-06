<script lang="ts">
  import { Button, Card, Dialog, Spinner } from "@project-reborn/components";
  import { onMount } from "svelte";
  import { go, post } from "./forum";

  // viewthread.php's Delete Post dialog, which a post's delete button opens. The
  // page comes back without the post, or the board when the thread went with it.
  let target = $state<string | null>(null);
  let working = $state(false);
  let failed = $state(false);

  onMount(() => {
    const open = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(".delete-post");
      if (button) {
        failed = false;
        target = button.dataset.delete ?? null;
      }
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  });

  async function proceed() {
    working = true;
    const answer = await post(`/forum/posts/${target}/delete`, {}).catch(() => ({ ok: false, location: "" }));
    if (answer.ok) {
      if (answer.location) go(answer.location);
      else window.location.reload();
      return;
    }
    working = false;
    failed = true;
  }
</script>

{#snippet title()}Delete Post{/snippet}

<Dialog
  open={target !== null}
  label="Delete Post"
  class="m-auto w-[300px] bg-transparent backdrop:bg-black/40"
  onclose={() => {
    if (!working) target = null;
  }}
>
  <Card color="orange" header={title}>
    <div class="text-[11px]">
      {#if working}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if failed}
        <p class="mb-2">An unknown error occurred. Please try again in a couple of minutes.</p>
        <p><Button onclick={() => (target = null)}>OK</Button></p>
      {:else}
        <p class="mb-2">Are you sure you want to delete this post? This cannot be reverted.</p>
        <p class="flex gap-1">
          <Button onclick={() => (target = null)}>Cancel</Button>
          <Button onclick={proceed}>Proceed</Button>
        </p>
      {/if}
    </div>
  </Card>
</Dialog>
