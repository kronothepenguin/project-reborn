<script lang="ts">
  import { onMount } from "svelte";
  import BBCodeEditor from "../bbcode-editor.svelte";

  let { initial = "" }: { initial?: string } = $props();

  let value = $state("");

  onMount(() => {
    value = initial;
  });
</script>

<BBCodeEditor bind:value label="Story" />
<button type="button" onclick={() => (value = "[s]second[/s]")}>Replace</button>
<output data-testid="value">{value}</output>
