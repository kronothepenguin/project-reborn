<script lang="ts">
  import { Button, Card, Dialog, Tab, TabList, Tabs } from "@project-reborn/components";
  import { onMount } from "svelte";
  import sprite from "../../assets/me/tags.gif";

  // source holds the habbo's tags and its limit; others holds the cloud of the
  // Others Like... tab, which the page draws.
  interface Props {
    source: string;
    others: string;
  }

  let { source, others }: Props = $props();

  // me.php's questions. Holo asked from an older list after each change.
  const questions = [
    "What is your favourite TV show?",
    "Who is your favourite actor?",
    "Who is your favourite actress?",
    "Do you have a nickname?",
    "What is your favorite song?",
    "How do you describe yourself?",
    "What is your favorite band?",
    "What is your favorite comic?",
    "What are you like?",
    "What is your favorite food?",
    "What sport you play?",
    "Who was your first love?",
    "What is your favorite movie?",
    "Cats, dogs, or something more exotic?",
    "What is your favorite color?",
    "Do you have a favorite staff member?",
  ];
  const limitText = "You've reached the tag limit - delete one of your tags if you want to add a new one.";

  let tab = $state("mine");
  let tags = $state<string[]>([]);
  let max = $state(0);
  let question = $state("");
  let draft = $state("");
  let refusal = $state("");
  let panel = $state<HTMLElement>();

  const ask = () => questions[Math.floor(Math.random() * questions.length)];

  const info = $derived(
    tags.length >= max
      ? "Tag limit reached. You need to remove one of your tags before adding another."
      : tags.length === 0
        ? "You have no tags. Answer the question below or just add a tag of your choice."
        : "You haven't used up all your tags yet - add some more!",
  );

  onMount(() => {
    const element = document.getElementById(source) as HTMLElement;
    tags = [...element.querySelectorAll("li")].map((li) => li.textContent ?? "");
    max = Number(element.dataset.max);
    question = ask();
    const cloud = document.getElementById(others);
    if (cloud && panel) {
      panel.append(cloud);
      cloud.hidden = false;
    }
  });

  async function send(path: string, body: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: response.ok, answer: (await response.json()) as { tags: string[]; error?: string } };
  }

  async function add() {
    const typed = draft;
    draft = "";
    const { ok, answer } = await send("/me/tags", { tag: typed });
    tags = answer.tags;
    if (ok) {
      question = ask();
    } else {
      refusal = answer.error === "limit" ? limitText : "Invalid tag";
    }
  }

  async function remove(tag: string) {
    const { answer } = await send(`/me/tags/${encodeURIComponent(tag)}/delete`, {});
    tags = answer.tags;
    question = ask();
  }
</script>

<div class="relative mt-1">
  <h2 class="absolute top-0 left-0 pt-1 pl-2.5 text-sm font-bold text-lime-600">Tags</h2>
  <Tabs bind:value={tab} color="green">
    <TabList>
      <Tab value="mine">My Tags</Tab>
      <Tab value="others">Others Like...</Tab>
    </TabList>
  </Tabs>
</div>
<div role="tabpanel" aria-label="My Tags" hidden={tab !== "mine"}>
  <div class="border-b border-dashed border-mauve-300 py-1 pl-4">{info}</div>
  <div class="px-4 pt-2 pb-3">
    {#if tags.length > 0}
      <ul>
        {#each tags as tag (tag)}
          <li class="mr-1 inline">
            <a class="text-xs text-black no-underline hover:underline" href={`/tags?tag=${encodeURIComponent(tag)}`}>{tag}</a>
            <button
              type="button"
              title="Remove tag"
              aria-label={`Remove ${tag}`}
              class="ml-1 inline-block h-2.5 w-2.5 cursor-pointer bg-no-repeat bg-position-[0_0] hover:bg-position-[-10px_0]"
              style={`background-image: url(${sprite.src})`}
              onclick={() => remove(tag)}
            ></button>
          </li>
        {/each}
      </ul>
    {/if}
    {#if tags.length < max}
      <form
        class="mt-[1em] flex items-center"
        onsubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <span class="flex-1 text-olive-500">{question}</span>
        <input
          class="mr-5 ml-1 w-[100px] border border-neutral-600 bg-white px-1 py-0.5 text-black"
          maxlength="20"
          aria-label="New tag"
          bind:value={draft}
        />
        <Button type="submit" size="compact">Add tag</Button>
      </form>
    {/if}
  </div>
</div>
<div role="tabpanel" aria-label="Others Like..." class="px-4 py-2" hidden={tab !== "others"} bind:this={panel}></div>
<Dialog open={refusal !== ""} label="Tags" class="m-auto bg-transparent backdrop:bg-black/40" onclose={() => (refusal = "")}>
  <Card color="orange">
    {#snippet header()}Tags{/snippet}
    <p class="mb-2.5">{refusal}</p>
    <div class="text-right"><Button onclick={() => (refusal = "")}>OK</Button></div>
  </Card>
</Dialog>
