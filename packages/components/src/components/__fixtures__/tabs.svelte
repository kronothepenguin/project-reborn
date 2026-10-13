<script lang="ts">
  import TabPanel from "../tab-panel.svelte";
  import Tab from "../tab.svelte";
  import Tabs from "../tabs.svelte";

  interface Item {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string;
    tabs?: Item[];
  }

  let { value = $bindable(undefined), tabs = [] }: Props = $props();
</script>

<Tabs bind:value>
  {#each tabs as tab (tab.value)}
    <Tab value={tab.value} disabled={tab.disabled}>{tab.label}</Tab>
  {/each}
  {#each tabs as tab (tab.value)}
    <TabPanel value={tab.value}>Panel {tab.label}</TabPanel>
  {/each}
</Tabs>
