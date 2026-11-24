<script lang="ts">
  import { Button, Card, Dialog, Spinner } from "@project-reborn/components";
  import { untrack } from "svelte";

  // The HTML5 port of Holo's Flash BadgeEditor, which draws itself into
  // #editor-container once its script runs, so the container stays in the page and
  // the script loads on the first opening.
  interface Props {
    open: boolean;
    group: string;
    code: string;
  }

  let { open = $bindable(false), group, code }: Props = $props();

  type Host = {
    HabboBadgeEditorConfig?: Record<string, string>;
    HabboBadgeEditor?: { onSave: (code: string) => void; onCancel: () => void };
  };

  let loaded = false;
  let saving = $state(false);
  let failed = $state(false);

  async function save(next: string) {
    saving = true;
    try {
      const response = await fetch(`/groups/${group}/badge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ code: next }),
      });
      if (response.ok) {
        location.reload();
        return;
      }
    } catch {
      // The answer below covers a request that never came back.
    }
    saving = false;
    failed = true;
  }

  $effect(() => {
    if (!open || loaded) return;
    untrack(() => {
      loaded = true;
      const host = window as unknown as Host;
      host.HabboBadgeEditorConfig = {
        badge_data: code,
        assetsPath: "/habbo-widgets/badge-editor",
        assetBundlePath: "",
        badge_data_url: "data/badge_data.xml",
        localization_url: "data/badge_editor.xml",
        groupId: group,
      };
      host.HabboBadgeEditor = { onSave: save, onCancel: () => (open = false) };
      const script = document.createElement("script");
      script.src = "/habbo-widgets/badge-editor/badge-editor.js";
      document.body.append(script);
    });
  });
</script>

<Dialog bind:open label="Badge editor" class="m-auto bg-transparent backdrop:bg-black/40">
  <Card>
    <div class="relative text-base">
      <div id="editor-container" class="h-[366px] w-[280px]"></div>
      {#if saving}
        <div class="absolute inset-0 flex items-center justify-center bg-white/80"><Spinner /></div>
      {/if}
      {#if failed}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white p-5.5 text-center">
          <p>An unknown error occurred. Please try again in a couple of minutes.</p>
          <Button onclick={() => (failed = false)}>OK</Button>
        </div>
      {/if}
    </div>
  </Card>
</Dialog>
