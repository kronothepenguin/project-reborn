<script lang="ts">
  import { BBCodeEditor, Button, Icon, Notice } from "@project-reborn/components";
  import { onMount, tick } from "svelte";
  import { go, now, post, viewerOf, type Viewer } from "./forum";
  import PostPreview from "./post-preview.svelte";

  // viewthread.php's message form under the posts: Post reply opens it empty and
  // hides itself, a post's Quote opens it with that post quoted, and its Modify
  // with the post to change, as Holo's script did. source names the element
  // holding the thread, the habbo's own post box and whether smilies show.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  let open = $state(false);
  let editing = $state<string | null>(null);
  let message = $state("");
  let error = $state("");
  let saving = $state(false);
  let preview = $state<{ html: string; date: string } | null>(null);
  let smilies = $state(false);
  let thread = $state("");
  let me = $state<Viewer>(viewerOf({}));
  let form = $state<HTMLElement>();

  const replyLinks = () =>
    ["create-post-message", "create-post-message-lower"].map((id) => document.getElementById(id)).filter((link) => link !== null);

  onMount(() => {
    const data = (document.getElementById(source) as HTMLElement).dataset;
    me = viewerOf(data);
    smilies = data.smilies === "true";
    thread = data.thread ?? "";
    for (const link of replyLinks()) link.addEventListener("click", create);
    const raw = (id = "") => (document.getElementById(`post-raw-${id}`) as HTMLInputElement).value;
    const pick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const quote = target.closest<HTMLElement>(".quote-post-link");
      const edit = target.closest<HTMLElement>(".edit-post-link");
      if (quote) show(`[quote]${raw(quote.dataset.quote)}[/quote]`, null);
      if (edit) show(raw(edit.dataset.edit), edit.dataset.edit ?? null);
    };
    document.addEventListener("click", pick);
    return () => document.removeEventListener("click", pick);
  });

  async function show(text: string, post: string | null) {
    message = text;
    editing = post;
    preview = null;
    error = "";
    open = true;
    await tick();
    form?.scrollIntoView();
  }

  function create() {
    for (const link of replyLinks()) link.hidden = true;
    show("", null);
  }

  function cancel() {
    open = false;
    preview = null;
    for (const link of replyLinks()) link.hidden = false;
  }

  async function showPreview() {
    const answer = await post("/bbcode/preview", { text: message });
    preview = { html: answer.html ?? "", date: now() };
  }

  // An edit redraws the page it was made on, as Holo's did.
  async function save() {
    saving = true;
    const path = editing ? `/forum/posts/${editing}` : `/forum/threads/${thread}/posts`;
    const answer = await post(path, { message }).catch(() => ({ ok: false, error: "", location: "" }));
    if (answer.ok) {
      if (answer.location) go(answer.location);
      else window.location.reload();
      return;
    }
    if (answer.error === "closed") {
      window.location.reload();
      return;
    }
    saving = false;
    preview = null;
    error = answer.error || "An unknown error occurred. Please try again in a couple of minutes.";
  }
</script>

{#if open}
  <div bind:this={form}>
    {#if preview}
      <PostPreview
        {me}
        title="Post Preview"
        html={preview.html}
        date={preview.date}
        {saving}
        onmodify={() => (preview = null)}
        oncancel={cancel}
        onsave={save}
      />
    {:else}
      <table class="w-full border-collapse" aria-label="Reply">
        <tbody>
          <tr class="bg-olive-200">
            <td class="w-49.5 pt-10 text-right align-top">Message:</td>
            <td colspan="2">
              <div class="m-1.5">
                {#if error}<div class="mb-1.5 w-123.5"><Notice variant="red" role="alert">{error}</Notice></div>{/if}
                <button type="button" class="relative z-[1] float-right cursor-pointer pt-0.5 pr-2.5 text-neutral-400 hover:underline" onclick={showPreview}
                  >Preview &raquo;</button
                >
                <div class="w-191.5"><BBCodeEditor bind:value={message} {smilies} label="Message" rows={5} /></div>
                <br /><br />
                <div class="flex gap-1.5">
                  <Button variant="red" onclick={cancel}><span class="flex items-center gap-1.5"><Icon variant="cancel" />Cancel</span></Button>
                  <Button variant="green" disabled={saving} onclick={save}
                    ><span class="flex items-center gap-1.5"><Icon variant="save" />Save</span></Button
                  >
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    {/if}
  </div>
{/if}
