<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Table from "../table.svelte";

  let { ...rest }: Omit<ComponentProps<typeof Table>, "children"> = $props();
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
