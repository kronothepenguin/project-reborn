<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";
  import Table from "../table.svelte";

  let { ...rest }: HTMLTableAttributes = $props();
</script>

<Table {...rest}>
  <thead>
    <tr><th>Habbo</th><th>Group</th></tr>
  </thead>
  <tbody>
    <tr><td>Admin</td><td>Administrators</td></tr>
    <tr><td>Frank</td><td>Moderators</td></tr>
  </tbody>
</Table>
