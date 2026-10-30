<script lang="ts">
  import Select from "../select.svelte";

  let value = $state("2");
</script>

<Select bind:value name="month">
  <option value="1">January</option>
  <option value="2">February</option>
  <option value="3">March</option>
</Select>
<span data-testid="echo">{value}</span>
