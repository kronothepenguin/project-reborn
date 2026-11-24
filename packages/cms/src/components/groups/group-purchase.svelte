<script lang="ts" module>
  // Limits are what grouppurchase.php checked before it showed its form.
  export interface Limits {
    enabled: boolean;
    price: number;
    credits: number;
    owned: number;
    maxOwned: number;
    nameMax: number;
    descriptionMax: number;
  }
</script>

<script lang="ts">
  import { Button, Card, Dialog, GroupBadge, Spinner } from "@project-reborn/components";
  import { untrack } from "svelte";

  interface Props {
    open: boolean;
    limits: Limits;
  }

  let { open = $bindable(false), limits = $bindable() }: Props = $props();

  // The header's My Groups and the Me page each hold a purchase dialog.
  const uid = $props.id();

  // Holo's badge for a new group, which the dialog shows beside its texts.
  const newBadge = "b0503Xs09114s05013s05015";

  type Refusal = "disabled" | "credits" | "owned" | "blank" | "nameLong" | "descriptionLong" | "taken";
  type View =
    | { name: "form" }
    | { name: "wait" }
    | { name: "failed"; why: "disabled" | "credits" | "owned" }
    | { name: "back"; message: string }
    | { name: "bought"; id: number; group: string }
    | { name: "unknown" };

  // The answers of grouppurchase.php's confirmation that send the habbo back to
  // the form.
  const backMessages: Record<string, string> = {
    blank: "Please fill in all fields!",
    nameLong: "The group name you have selected is too long.",
    descriptionLong: "The group description you have entered is too long.",
    taken: "A group with this name already exists.",
  };

  let view = $state<View>({ name: "form" });
  let name = $state("");
  let description = $state("");

  function opening(): View {
    if (!limits.enabled) return { name: "failed", why: "disabled" };
    if (limits.credits < limits.price) return { name: "failed", why: "credits" };
    if (limits.owned >= limits.maxOwned) return { name: "failed", why: "owned" };
    return { name: "form" };
  }

  // Each opening starts afresh, as Holo's dialog fetched its form again; a
  // purchase that changes the limits does not count as one.
  $effect(() => {
    if (!open) return;
    untrack(() => {
      name = "";
      description = "";
      view = opening();
    });
  });

  function close() {
    open = false;
  }

  async function confirm() {
    view = { name: "wait" };
    try {
      const response = await fetch("/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const answer = (await response.json()) as { id?: number; name?: string; error?: Refusal };
      if (response.ok && answer.id) {
        limits.credits -= limits.price;
        limits.owned += 1;
        view = { name: "bought", id: answer.id, group: answer.name ?? name };
      } else if (answer.error === "disabled" || answer.error === "credits" || answer.error === "owned") {
        view = { name: "failed", why: answer.error };
      } else if (answer.error && backMessages[answer.error]) {
        view = { name: "back", message: backMessages[answer.error] };
      } else {
        view = { name: "unknown" };
      }
    } catch {
      view = { name: "unknown" };
    }
  }

  function back() {
    name = "";
    description = "";
    view = opening();
  }
</script>

<Dialog bind:open label="Create a group" class="m-auto w-94.5 bg-transparent backdrop:bg-black/40" onclose={close}>
  <Card color="orange">
    {#snippet header()}
      <span class="relative block">
        Create a group
        <button type="button" class="absolute top-0 right-0 cursor-pointer px-1.5" aria-label="Close" onclick={close}
          >X</button
        >
      </span>
    {/snippet}
    <div class="text-base">
      {#if view.name === "wait"}
        <div class="py-2.5 text-center"><Spinner /></div>
      {:else if view.name === "form"}
        <form
          onsubmit={(event) => {
            event.preventDefault();
            confirm();
          }}
        >
          <p class="mb-2.5 flow-root">
            <GroupBadge code={newBadge} class="float-left mr-1.5" />Fill in the form below to create your own group.
            Creating a group will cost you <b>{limits.price}</b> credits.
          </p>
          <p class="mb-2.5">
            <label for="{uid}-name"><b>Group Name</b></label><br />
            <input
              id="{uid}-name"
              class="border border-neutral-600 bg-white px-1.5 text-black"
              maxlength={limits.nameMax}
              bind:value={name}
            />
          </p>
          <p class="mb-2.5">
            <label for="{uid}-description"><b>Group Description</b></label><br />
            <textarea
              id="{uid}-description"
              class="h-50 w-[98%] border border-neutral-600 bg-white px-1.5 text-black"
              maxlength={limits.descriptionMax}
              bind:value={description}
            ></textarea>
          </p>
          <p class="mb-2.5">You can modify these settings at any time after creating the group.</p>
          <p class="flex gap-1.5">
            <Button type="submit">Purchase</Button>
            <Button onclick={close}>Cancel</Button>
          </p>
        </form>
      {:else if view.name === "failed"}
        <p class="mb-2.5">Purchasing the group failed. Please try again later.</p>
        <div class="mb-2.5">
          <p>
            {#if view.why === "disabled"}
              Purchasing groups has been disabled by the Hotel Management. Please try again later.
            {:else if view.why === "credits"}
              You don't have enough Credits. <a class="underline" href="/credits">Get more here!</a>
            {:else}
              You have reached the maximum amount of <i>owned</i> groups per user ({limits.maxOwned}).
            {/if}
          </p>
        </div>
        <p><Button onclick={close}>Done</Button></p>
      {:else if view.name === "back"}
        <p class="mb-2.5">{view.message}</p>
        <p><Button onclick={back}>Back</Button></p>
      {:else if view.name === "bought"}
        <p class="mb-2.5 flow-root">
          <b>Group Purchased</b><br /><br /><GroupBadge code={newBadge} class="float-left mr-1.5" />Congratulations! You are
          now the proud owner of <b>{view.group}</b>.<br /><br />Click
          <a class="underline" href={`/groups/${view.id}`}>here</a> to go to your group home right away, or use the button
          below to close this window.
        </p>
        <p><Button onclick={close}>Done</Button></p>
      {:else}
        <p class="mb-2.5">An unknown error occurred. Please try again in a couple of minutes.</p>
        <p><Button onclick={close}>OK</Button></p>
      {/if}
    </div>
  </Card>
</Dialog>
