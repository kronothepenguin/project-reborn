<script lang="ts">
  import { Button, Card, Dialog, Spinner } from "@project-reborn/components";
  import { untrack } from "svelte";

  // Holo's member list for a group's admins. me is the active habbo, whose own
  // tick turns Revoke rights and Remove off, as Holo's script did.
  interface Props {
    open: boolean;
    group: string;
    me: string;
  }

  let { open = $bindable(false), group, me }: Props = $props();

  type Row = { id: number; name: string; owner: boolean; admin: boolean };
  type List = { members: number; pending: number; page: number; pages: number; total: number; rows: Row[] };
  type Tab = "members" | "pending";
  type Action = "promote" | "demote" | "remove" | "accept" | "decline";

  let tab = $state<Tab>("members");
  let list = $state<List | null>(null);
  let titles = $state({ members: "Members", pending: "Pending members" });
  let checked = $state<number[]>([]);
  let confirming = $state<{ action: Action; text: string } | null>(null);
  let working = $state(false);
  let failure = $state(false);

  // The texts of groups_confirm_*.php.
  const confirmations: Record<Action, string> = {
    promote: "Are you sure you want to give admin rights to the selected member(s)?",
    demote: "Are you sure you want to revoke the admin rights of the selected member(s)?",
    remove: "Are you sure you want to delete this (these) member(s) from the group?",
    accept: "Are you sure you want to accept this (these) new member(s) into the group?",
    decline: "Are you sure you want to decline this (these) member(s)?",
  };

  async function load(which: Tab, page: number) {
    list = null;
    checked = [];
    const response = await fetch(`/groups/${group}/members?${which === "pending" ? "pending=true&" : ""}page=${page}`, {
      headers: { Accept: "application/json" },
    });
    const answer = (await response.json()) as List;
    list = answer;
    titles = { members: `Members (${answer.members})`, pending: `Pending Members (${answer.pending})` };
  }

  $effect(() => {
    if (!open) return;
    untrack(() => load(tab, 1));
  });

  function switchTo(which: Tab) {
    if (tab === which) return;
    tab = which;
    load(which, 1);
  }

  const selected = $derived(list ? list.rows.filter((row) => checked.includes(row.id)) : []);
  const admins = $derived(selected.some((row) => row.admin));
  const members = $derived(selected.some((row) => !row.admin));
  const self = $derived(selected.some((row) => String(row.id) === me));
  const enabled = $derived({
    promote: members && !admins,
    demote: admins && !members && !self,
    remove: (admins || members) && !self,
    accept: selected.length > 0,
    decline: selected.length > 0,
  });

  async function run(action: Action) {
    working = true;
    let ok = true;
    for (const row of selected) {
      const response = await fetch(`/groups/${group}/members/${row.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: "{}",
      }).catch(() => null);
      ok = ok && !!response?.ok;
    }
    working = false;
    confirming = null;
    failure = !ok;
    await load(tab, 1);
  }

  function toggle(id: number, on: boolean) {
    checked = on ? [...checked, id] : checked.filter((other) => other !== id);
  }

  const rowClass = (index: number) => (Math.floor(index / 2) % 2 === 0 ? "bg-olive-200" : "");
  const button = (on: boolean) => (on ? "" : "[&_span]:text-neutral-400");
</script>

{#snippet tabs()}
  <span class="relative flex items-end gap-1 text-left">
    {#each [["members", titles.members], ["pending", titles.pending]] as const as [which, label] (which)}
      <button
        type="button"
        role="tab"
        aria-selected={tab === which}
        class={["cursor-pointer rounded-t px-3 py-0.5", tab === which ? "bg-white text-black" : "text-white"]}
        onclick={() => switchTo(which)}>{label}</button
      >
    {/each}
    <button type="button" class="ml-auto cursor-pointer px-1" aria-label="Close" onclick={() => (open = false)}>X</button>
  </span>
{/snippet}

<Dialog bind:open label="Members" class="m-auto w-[480px] bg-transparent backdrop:bg-black/40">
  <Card color="black" header={tabs}>
    <div class="text-[11px]" role="tabpanel" aria-label={tab === "members" ? "Members" : "Pending members"}>
      <div class="h-[200px] overflow-auto">
        {#if list === null}
          <div class="py-2 text-center"><Spinner /></div>
        {:else}
          <ul class="mt-2.5 flow-root">
            {#if list.rows.length === 0}
              There are no pending membership requests at this time. Please check back later.
            {/if}
            {#each list.rows as row, i (row.id)}
              <li class={["float-left w-1/2", rowClass(i)]}>
                <div class={["pb-1 pl-[5px]", i % 2 === 1 && "border-l border-olive-300"]}>
                  <div class="float-right mt-px h-4 w-4">
                    {#if row.owner}
                      <img src="/web-gallery/images/groups/owner_icon.gif" width="15" height="15" alt="Owner" title="Owner" />
                    {:else if row.admin}
                      <img
                        src="/web-gallery/images/groups/administrator_icon.gif"
                        width="15"
                        height="15"
                        alt="Administrator"
                        title="Administrator"
                      />
                    {/if}
                  </div>
                  <input
                    type="checkbox"
                    class="m-0 p-0 align-middle"
                    aria-label={`Select ${row.name}`}
                    disabled={row.owner || (tab === "pending" && String(row.id) === me)}
                    checked={checked.includes(row.id)}
                    onchange={(event) => toggle(row.id, event.currentTarget.checked)}
                  />
                  <a class="text-black no-underline hover:underline" href={`/home?name=${encodeURIComponent(row.name)}`}
                    >{row.name}</a
                  >
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      {#if list}
        {@const from = (list.page - 1) * 12}
        <div class="text-center">{from + 1} - {from + list.rows.length} / {list.total}</div>
        <div class="text-center">
          {#if list.page > 1}
            <button type="button" class="cursor-pointer underline" onclick={() => list && load(tab, 1)}>First</button>
          {:else}First{/if}
          |
          {#if list.page > 1}
            <button type="button" class="cursor-pointer underline" onclick={() => list && load(tab, list.page - 1)}>&lt;&lt;</button>
          {:else}&lt;&lt;{/if}
          |
          {#if list.page < list.pages}
            <button type="button" class="cursor-pointer underline" onclick={() => list && load(tab, list.page + 1)}>&gt;&gt;</button>
          {:else}&gt;&gt;{/if}
          |
          {#if list.page < list.pages}
            <button type="button" class="cursor-pointer underline" onclick={() => list && load(tab, list.pages)}>Last</button>
          {:else}Last{/if}
        </div>
      {/if}
      <div class="mt-2 flex gap-1">
        {#if tab === "members"}
          {#each [["promote", "Give rights"], ["demote", "Revoke rights"], ["remove", "Remove"]] as const as [action, label] (action)}
            <span class={button(enabled[action])}>
              <Button
                aria-disabled={!enabled[action]}
                onclick={() => enabled[action] && (confirming = { action, text: confirmations[action] })}>{label}</Button
              >
            </span>
          {/each}
        {:else}
          {#each [["accept", "Accept"], ["decline", "Reject"]] as const as [action, label] (action)}
            <span class={button(enabled[action])}>
              <Button
                aria-disabled={!enabled[action]}
                onclick={() => enabled[action] && (confirming = { action, text: confirmations[action] })}>{label}</Button
              >
            </span>
          {/each}
        {/if}
        <span class="ml-auto"><Button onclick={() => (open = false)}>Close</Button></span>
      </div>
    </div>
  </Card>
</Dialog>

<Dialog
  open={confirming !== null || failure}
  label="Group"
  class="m-auto w-[300px] bg-transparent backdrop:bg-black/40"
  onclose={() => {
    if (!working) {
      confirming = null;
      failure = false;
    }
  }}
>
  <Card>
    <div class="text-[11px]">
      {#if working}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if confirming}
        {@const action = confirming.action}
        <p class="mb-2">{confirming.text}</p>
        <p class="flex gap-1">
          <Button onclick={() => (confirming = null)}>Cancel</Button>
          <Button onclick={() => run(action)}>OK</Button>
        </p>
      {:else if failure}
        <p class="mb-2">An unknown error occurred. Please try again in a couple of minutes.</p>
        <p><Button onclick={() => (failure = false)}>OK</Button></p>
      {/if}
    </div>
  </Card>
</Dialog>
