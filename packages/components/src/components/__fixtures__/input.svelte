<script lang="ts">
  import Input from "../input.svelte";

  let value = $state("start");
</script>

<Input bind:value name="email" />
<span data-testid="echo">{value}</span>
