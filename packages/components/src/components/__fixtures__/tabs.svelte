<script lang="ts">
  import type { TabsColor } from "../../context";
  import TabList from "../tab-list.svelte";
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
    color?: TabsColor;
    tabs?: Item[];
  }

  let { value = $bindable(undefined), color, tabs = [] }: Props = $props();
</script>

<Tabs bind:value {color}>
  <TabList>
    {#each tabs as tab (tab.value)}
      <Tab value={tab.value} disabled={tab.disabled}>{tab.label}</Tab>
    {/each}
  </TabList>
  {#each tabs as tab (tab.value)}
    <TabPanel value={tab.value} class="p-2">Panel {tab.label}</TabPanel>
  {/each}
</Tabs>
