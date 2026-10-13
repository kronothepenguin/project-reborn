<script lang="ts">
  import Button from "../components/button.svelte";
  import Card from "../components/card.svelte";
  import FormField from "../components/form-field.svelte";
  import Input from "../components/input.svelte";

  let username = $state("");
  let password = $state("");
</script>

<Card>
  {#snippet header()}
    <h2>Sign in</h2>
  {/snippet}

  <FormField label="Username" help="Your hotel name">
    <Input name="username" bind:value={username} />
  </FormField>

  <FormField label="Password">
    <Input name="password" type="password" bind:value={password} />
  </FormField>

  <Button type="submit">Sign in</Button>
</Card>
