<script lang="ts">
  import { BBCodeEditor, Button, Icon, Notice } from "@project-reborn/components";
  import { onMount, tick } from "svelte";
  import { go, now, post, viewerOf, type Viewer } from "./forum";
  import PostPreview from "./post-preview.svelte";

  // newtopic.php's form: either New Thread button of the board swaps the list of
  // threads for it, as Holo's did. source names the element holding the habbo's
  // own post box and whether smilies show.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  let open = $state(false);
  let title = $state("");
  let message = $state("");
  let error = $state("");
  let saving = $state(false);
  let preview = $state<{ html: string; date: string } | null>(null);
  let smilies = $state(false);
  let me = $state<Viewer>(viewerOf({}));
  let field = $state<HTMLInputElement>();

  onMount(() => {
    const data = (document.getElementById(source) as HTMLElement).dataset;
    me = viewerOf(data);
    smilies = data.smilies === "true";
    for (const id of ["newtopic-upper", "newtopic-lower"]) {
      document.getElementById(id)?.addEventListener("click", start);
    }
  });

  async function start() {
    open = true;
    (document.getElementById("group-topiclist-container") as HTMLElement).hidden = true;
    await tick();
    field?.focus();
  }

  async function showPreview() {
    const answer = await post("/bbcode/preview", { text: message });
    preview = { html: answer.html ?? "", date: now() };
  }

  // Holo checked the title in the browser with its own words, and the server with
  // others.
  async function save() {
    if (title.trim() === "") {
      preview = null;
      error = "Topic title may not be empty";
      return;
    }
    saving = true;
    const answer = await post("/forum/threads", { title, message }).catch(() => ({ ok: false, error: "", location: "" }));
    if (answer.ok && answer.location) {
      go(answer.location);
      return;
    }
    saving = false;
    preview = null;
    error = answer.error || "An unknown error occurred. Please try again in a couple of minutes.";
  }
</script>

{#if open}
  <table class="w-full border-collapse" aria-label="New Thread">
    <tbody>
      <tr>
        <td class="w-[148px]"></td>
        <td></td>
        <td></td>
      </tr>
      {#if preview}
        <tr>
          <td colspan="3" class="px-1 py-1.5">
            <PostPreview
              {me}
              title={title.trim() || "Post Preview"}
              html={preview.html}
              date={preview.date}
              {saving}
              onmodify={() => (preview = null)}
              oncancel={() => (window.location.href = "/forum")}
              onsave={save}
            />
          </td>
        </tr>
      {:else}
        <tr class="bg-olive-200">
          <td class="text-right"><label for="new-topic-name">Topic:</label></td>
          <td colspan="2">
            <div class="m-[5px]">
              <input
                id="new-topic-name"
                type="text"
                size="50"
                class="mt-2.5 border border-neutral-500 bg-white px-1"
                bind:value={title}
                bind:this={field}
              />
            </div>
          </td>
        </tr>
      {/if}
      <tr class="bg-olive-200">
        <td></td>
        <td colspan="2">
          {#if error}<div class="m-[5px] w-[370px]"><Notice variant="red" role="alert">{error}</Notice></div>{/if}
        </td>
      </tr>
      {#if !preview}
        <tr class="bg-olive-200">
          <td class="pt-[30px] text-right align-top">Post:</td>
          <td colspan="2">
            <div class="m-[5px]">
              <button type="button" class="relative z-[1] float-right cursor-pointer pt-0.5 pr-2 text-neutral-400 hover:underline" onclick={showPreview}
                >Preview &raquo;</button
              >
              <div class="w-[575px]"><BBCodeEditor bind:value={message} {smilies} label="Post" rows={5} /></div>
              <br /><br />
              <div class="flex gap-1">
                <Button variant="red" href="/forum"><span class="flex items-center gap-1"><Icon variant="cancel" />Cancel</span></Button>
                <Button variant="green" disabled={saving} onclick={save}
                  ><span class="flex items-center gap-1"><Icon variant="save" />Save</span></Button
                >
              </div>
            </div>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
{/if}
