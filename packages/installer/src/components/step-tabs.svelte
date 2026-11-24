<script lang="ts">
  import { Tab, TabList, Tabs } from "@project-reborn/components";

  // The installer's steps as tabs, in their order, the current one selected.
  // A step up to the one that waits opens its page; a step after it is still
  // to come, shown and disabled. waiting is empty once the hotel is installed.
  interface Props {
    current: string;
    waiting: string;
  }

  let { current, waiting }: Props = $props();

  const steps = [
    { id: "config", label: "1. Configuration" },
    { id: "site", label: "2. Site" },
    { id: "settings", label: "3. Settings" },
    { id: "client", label: "4. Client files" },
    { id: "admin", label: "5. Administrator" },
  ];

  const last = $derived(steps.findIndex((step) => step.id === waiting));

  // Choosing a tab, by click or by arrow key, opens its step.
  let value = $state(current);
  $effect(() => {
    if (value !== current) location.assign(`/installer/${value}`);
  });
</script>

<Tabs bind:value color="blue">
  <TabList class="max-sm:flex-wrap max-sm:justify-start">
    {#each steps as step, index (step.id)}
      <Tab value={step.id} disabled={index > last}>{step.label}</Tab>
    {/each}
  </TabList>
</Tabs>
