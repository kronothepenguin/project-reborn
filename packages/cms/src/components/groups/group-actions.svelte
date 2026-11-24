<script lang="ts">
  import { Button, Card, Dialog, Spinner } from "@project-reborn/components";

  // The view tools of group_profile.php for the active habbo. join is "join",
  // "request" or empty, favourite "make", "remove" or empty, and leave "true" or
  // "false", as the page writes them.
  interface Props {
    group: string;
    join: string;
    favourite: string;
    leave: string;
  }

  let { group, join, favourite, leave }: Props = $props();

  type Step =
    | { name: "closed" }
    | { name: "wait" }
    | { name: "confirm"; text: string; action: string }
    | { name: "answer"; text: string; reload: boolean }
    | { name: "left"; text: string };

  // The texts of groups_confirm_leave.php and the favourite confirmations.
  const confirmations: Record<string, string> = {
    leave: "Are you sure you want to leave this group?",
    favourite: "Are you sure you want to have this group as your favorite Group?",
    unfavourite: "Are you sure you don't want to have this Group as your favorite Group anymore?",
  };
  const failed = "An unknown error occurred. Please try again in a couple of minutes.";

  let step = $state<Step>({ name: "closed" });
  const open = $derived(step.name !== "closed");

  async function post(action: string) {
    const response = await fetch(`/groups/${group}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: "{}",
    });
    const answer = (await response.json().catch(() => ({}))) as { message?: string };
    return { ok: response.ok, message: answer.message ?? "" };
  }

  // Joining answers in the dialog, whose OK reloads the page, as Holo's did.
  async function joinGroup() {
    step = { name: "wait" };
    try {
      const { ok, message } = await post("join");
      step = { name: "answer", text: ok ? message : failed, reload: ok };
    } catch {
      step = { name: "answer", text: failed, reload: false };
    }
  }

  // Leaving and the favourite ask first; Holo then reloaded the page at once.
  async function confirmed(action: string) {
    step = { name: "wait" };
    try {
      const { ok, message } = await post(action);
      if (!ok) {
        step = { name: "answer", text: failed, reload: false };
        return;
      }
      if (action === "leave") step = { name: "left", text: message };
      location.reload();
    } catch {
      step = { name: "answer", text: failed, reload: false };
    }
  }

  const tool = "ml-1 cursor-pointer bg-[url(/web-gallery/v2/images/myhabbo_icons.png)] bg-no-repeat pb-[3px] text-black hover:underline";
</script>

<div class="mt-[5px] mr-2.5 ml-auto flex items-center">
  {#if join}
    <button type="button" class="{tool} ml-2.5 bg-position-[0_-239px] pl-[15px]" onclick={joinGroup}>
      {join === "request" ? "Request membership" : "Join"}
    </button>
  {/if}
  {#if favourite === "make"}
    <button
      type="button"
      class="{tool} bg-position-[0_-331px] pl-[18px]"
      onclick={() => (step = { name: "confirm", text: confirmations.favourite, action: "favourite" })}>Make favourite</button
    >
  {/if}
  {#if favourite === "remove"}
    <button
      type="button"
      class="{tool} bg-position-[0_-376px] pl-[18px]"
      onclick={() => (step = { name: "confirm", text: confirmations.unfavourite, action: "unfavourite" })}
      >Remove favourite</button
    >
  {/if}
  {#if leave === "true"}
    <button
      type="button"
      class="{tool} ml-2.5 bg-position-[0_-198px] pl-[15px]"
      onclick={() => (step = { name: "confirm", text: confirmations.leave, action: "leave" })}>Leave group</button
    >
  {/if}
</div>

<Dialog
  {open}
  label="Group"
  class="m-auto w-[300px] bg-transparent backdrop:bg-black/40"
  onclose={() => {
    if (step.name !== "wait") step = { name: "closed" };
  }}
>
  <Card>
    <div class="text-xs">
      {#if step.name === "wait"}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if step.name === "confirm"}
        {@const action = step.action}
        <p class="mb-2">{step.text}</p>
        <p class="flex gap-1">
          <Button onclick={() => (step = { name: "closed" })}>Cancel</Button>
          <Button onclick={() => confirmed(action)}>OK</Button>
        </p>
      {:else if step.name === "answer"}
        {@const reload = step.reload}
        <p class="mb-2">{step.text}</p>
        <p><Button onclick={() => (reload ? location.reload() : (step = { name: "closed" }))}>OK</Button></p>
      {:else if step.name === "left"}
        <p class="mb-2">{step.text}</p>
        <p>Please wait, you are being redirected..</p>
      {/if}
    </div>
  </Card>
</Dialog>
