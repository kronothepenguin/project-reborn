<script lang="ts">
  import Checkbox from "../checkbox.svelte";

  let checked = $state(false);
</script>

<Checkbox bind:checked name="remember">Remember me</Checkbox>
<span data-testid="echo">{checked}</span>
