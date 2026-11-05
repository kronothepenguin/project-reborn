<script lang="ts">
  import { Bubble, Button, Card, Dialog, GroupBadge, Icon, Spinner } from "@project-reborn/components";
  import { onMount } from "svelte";
  import BadgeEditor from "./badge-editor.svelte";
  import MemberList from "./member-list.svelte";

  // source holds the group's settings for group_settings.php's form. The island
  // stands on every group page, since the first island of a page carries Astro's
  // script for all of them; it shows itself to the group's admins alone, and its
  // Settings to the owner. me is the active habbo.
  interface Props {
    group: string;
    admin: string;
    owner: string;
    me: string;
    source: string;
  }

  let { group, admin, owner, me, source }: Props = $props();

  type Access = "open" | "moderated" | "closed" | "unlimited";

  let menu = $state(false);
  let settings = $state(false);
  let membersOpen = $state(false);
  let badgeOpen = $state(false);
  let name = $state("");
  let description = $state("");
  let access = $state<Access>("open");
  let initial = $state<Access>("open");
  let badge = $state("");
  let nameMax = $state(0);
  let descriptionMax = $state(0);
  let maxMembers = $state(0);

  type Step =
    | { name: "closed" }
    | { name: "wait"; title: string }
    | { name: "confirmType" }
    | { name: "result"; text: string }
    | { name: "confirmDelete" }
    | { name: "deleted"; text: string }
    | { name: "failed"; title: string };
  let step = $state<Step>({ name: "closed" });

  const title = "Edit Group Settings";
  const failed = "An unknown error occurred. Please try again in a couple of minutes.";

  // group_settings.php's four types, with their texts.
  const types: { value: Access; label: string; text: string; icon: string }[] = [
    { value: "open", label: "Regular", text: "", icon: "bg-position-[100%_-896px]" },
    { value: "moderated", label: "Exclusive", text: "Group Admin controls who can join.", icon: "bg-position-[100%_-720px]" },
    { value: "closed", label: "Private", text: "No one can join.", icon: "bg-position-[100%_-672px]" },
    {
      value: "unlimited",
      label: "Unlimited",
      text: "Anyone can join. No membership limit. Unable to browse members.",
      icon: "bg-position-[100%_-928px]",
    },
  ];
  // The warnings of the type change, in Holo's L10N words.
  const typeWords: Record<Access, string> = { open: "normal", moderated: "exclusive", closed: "private", unlimited: "large" };

  onMount(() => {
    const data = (document.getElementById(source) as HTMLElement).dataset;
    name = data.name ?? "";
    description = data.description ?? "";
    access = initial = (data.access ?? "open") as Access;
    badge = data.badge ?? "";
    nameMax = Number(data.nameMax);
    descriptionMax = Number(data.descriptionMax);
    maxMembers = Number(data.maxMembers);
  });

  // GroupUtils.validateGroupElements: at the limit Holo cut the text and said so.
  const nameFull = $derived(name.length >= nameMax);
  const descriptionFull = $derived(description.length >= descriptionMax);

  function openSettings() {
    menu = false;
    settings = true;
  }

  async function post(path: string, body: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const answer = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    return { ok: response.ok, text: answer.message ?? answer.error ?? "" };
  }

  function save() {
    if (access !== initial) {
      step = { name: "confirmType" };
      return;
    }
    update();
  }

  async function update() {
    step = { name: "wait", title };
    try {
      const { text } = await post(`/groups/${group}/settings`, { name, description, access });
      step = text ? { name: "result", text } : { name: "failed", title };
    } catch {
      step = { name: "failed", title };
    }
  }

  async function remove() {
    step = { name: "wait", title: "" };
    try {
      const { ok, text } = await post(`/groups/${group}/delete`, {});
      step = ok ? { name: "deleted", text } : { name: "failed", title: "" };
    } catch {
      step = { name: "failed", title: "" };
    }
  }

  const dialogOpen = $derived(step.name !== "closed");
  const dialogTitle = $derived(
    step.name === "confirmType" || step.name === "result" || (step.name !== "closed" && "title" in step && step.title)
      ? title
      : "",
  );
</script>

{#snippet titleBar()}{dialogTitle}{/snippet}

<svelte:window onclick={() => (menu = false)} />

{#if admin === "true"}

<div class="relative">
  <Button
    variant="dark"
    size="compact"
    onclick={(event) => {
      event.stopPropagation();
      menu = !menu;
    }}
  >
    <span class="flex items-center gap-1">
      <Icon variant="edit" />
      Edit
    </span>
  </Button>
  {#if menu}
    <Bubble tail="top" class="absolute top-full left-0 z-[1000] mt-2 w-40 text-taupe-500">
      <h3 class="mb-1 text-center text-[11px] font-bold uppercase">Edit group</h3>
      <ul>
        {#if owner === "true"}
          <li class="py-[5px]">
            <button type="button" class="cursor-pointer pb-[5px] pl-5 text-taupe-500 hover:underline" onclick={openSettings}
              >Settings</button
            >
          </li>
        {/if}
        <li class="py-[5px]">
          <button
            type="button"
            class="cursor-pointer pb-[5px] pl-5 text-taupe-500 hover:underline"
            onclick={() => {
              menu = false;
              badgeOpen = true;
            }}>Badge</button
          >
        </li>
        <li class="py-[5px]">
          <button
            type="button"
            class="cursor-pointer pb-[5px] pl-5 text-taupe-500 hover:underline"
            onclick={() => {
              menu = false;
              membersOpen = true;
            }}>Members</button
          >
        </li>
      </ul>
    </Bubble>
  {/if}
</div>

<MemberList bind:open={membersOpen} {group} {me} />
<BadgeEditor bind:open={badgeOpen} {group} code={badge} />

<Dialog bind:open={settings} label="Group settings" class="m-auto w-[480px] bg-transparent backdrop:bg-black/40">
  <Card color="black">
    {#snippet header()}
      <span class="relative block">
        Group settings
        <button type="button" class="absolute top-0 right-0 cursor-pointer px-1" aria-label="Close" onclick={() => (settings = false)}
          >X</button
        >
      </span>
    {/snippet}
    <form
      class="text-[11px]"
      onsubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div class="flow-root">
        <div class="float-left h-[274px] w-[224px]">
          <div class="float-left mt-[11px] mr-4 ml-[5px]"><GroupBadge code={badge} alt={name} /></div>
          <div class="float-left w-[164px]">
            {#if nameFull}<div class="text-red-600">Maximum Group name length reached</div>{/if}
            <label for="group_name" class="font-bold">Edit group name:</label>
            <input
              id="group_name"
              class="w-full border border-neutral-600 bg-white px-1 text-black"
              maxlength={nameMax}
              bind:value={name}
            />
          </div>
          <div class="clear-left pt-2">
            {#if descriptionFull}<div class="text-red-600">Description limit reached</div>{/if}
            <label for="group_description" class="font-bold">Edit text:</label>
            <span class="float-right">
              <label for="group_description-counter">Characters left:</label>
              <input
                id="group_description-counter"
                class="w-8 bg-amber-300 text-black"
                size="3"
                readonly
                value={Math.max(descriptionMax - description.length, 0)}
              />
            </span>
            <textarea
              id="group_description"
              class="mt-1 h-[150px] w-[98%] border border-neutral-600 bg-white px-1 text-black"
              maxlength={descriptionMax}
              bind:value={description}
            ></textarea>
          </div>
        </div>
        <fieldset class="float-left h-[274px] w-[224px] pl-2.5" disabled={initial === "unlimited"}>
          <legend class="pb-1 font-bold">Edit Group type:</legend>
          {#each types as type (type.value)}
            <label class="mb-1 flow-root">
              <input type="radio" class="float-left" name="group_type" value={type.value} bind:group={access} />
              <span class="float-left block w-[198px] pl-0.5">
                <span
                  class="float-left h-4 bg-[url(/web-gallery/v2/images/info_icons.png)] bg-no-repeat pr-[21px] {type.icon}"
                  >{type.label}</span
                >
                <span class="clear-left block text-[10px] text-taupe-500"
                  >{type.value === "open" ? `Anyone can join. ${maxMembers} members limit.` : type.text}</span
                >
                {#if type.value === "unlimited"}
                  <span class="block text-[10px] text-red-700"
                    >Note: If you choose the option 'unlimited' you will not be able to change the type later!</span
                  >
                {/if}
              </span>
            </label>
          {/each}
        </fieldset>
      </div>
      <div class="flex gap-1 pt-[7px]">
        <Button type="submit">Save changes</Button>
        <span class="ml-10"><Button variant="red" onclick={() => (step = { name: "confirmDelete" })}>Delete group</Button></span>
        <Button onclick={() => (settings = false)}>Cancel</Button>
      </div>
    </form>
  </Card>
</Dialog>

<Dialog
  open={dialogOpen}
  label={dialogTitle || "Group"}
  class="m-auto w-[300px] bg-transparent backdrop:bg-black/40"
  onclose={() => {
    if (step.name !== "wait" && step.name !== "deleted") step = { name: "closed" };
  }}
>
  <Card color="orange" header={dialogTitle ? titleBar : undefined}>
    <div class="text-[11px]">
      {#if step.name === "wait"}
        <div class="py-2 text-center"><Spinner /></div>
      {:else if step.name === "confirmType"}
        <p class="mb-2">
          Are you sure you want to change the group type to <strong>{typeWords[access]}</strong>?{access === "unlimited"
            ? " If you continue you can't change it back later!"
            : ""}
        </p>
        <p class="flex gap-1">
          <Button onclick={update}>OK</Button>
          <Button onclick={() => (step = { name: "closed" })}>Cancel</Button>
        </p>
      {:else if step.name === "result"}
        <p class="mb-2">{step.text}</p>
        <p><Button onclick={() => location.reload()}>Done</Button></p>
      {:else if step.name === "confirmDelete"}
        <p class="mb-2">Are you sure you want to delete this Group?</p>
        <p class="mb-2"><strong>You will lose everything currently on your group home!</strong></p>
        <p class="flex gap-1">
          <Button onclick={() => (step = { name: "closed" })}>Cancel</Button>
          <Button onclick={remove}>OK</Button>
        </p>
      {:else if step.name === "deleted"}
        <p class="mb-2">{step.text}</p>
        <p><Button href="/me">OK</Button></p>
      {:else if step.name === "failed"}
        <p class="mb-2">{failed}</p>
        <p><Button onclick={() => (step = { name: "closed" })}>OK</Button></p>
      {/if}
    </div>
  </Card>
</Dialog>
{/if}
