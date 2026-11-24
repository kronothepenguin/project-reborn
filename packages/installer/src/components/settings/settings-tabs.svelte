<script lang="ts">
  import { onMount } from "svelte";
  import { Tab, TabList, Tabs } from "@project-reborn/components";

  // The settings step's groups as tabs. The groups are the server's panels,
  // each an element with data-tab, its title, inside the element of id for.
  // A panel stays in the form while its tab is hidden, so that every field
  // posts. The tab of a panel the server marks refused opens first.
  interface Props {
    for: string;
  }

  let { for: id }: Props = $props();

  type Group = { value: string; title: string; panel: HTMLElement };

  let groups = $state.raw<Group[]>([]);
  let value = $state("");

  onMount(() => {
    const root = document.getElementById(id);
    if (!root) return;
    groups = [...root.querySelectorAll<HTMLElement>("[data-tab]")].map((panel, index) => {
      panel.id ||= `${id}-panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${id}-tab-${index}`);
      return { value: String(index), title: panel.dataset.tab ?? "", panel };
    });
    const refused = groups.find(
      (group) =>
        group.panel.dataset.refused === "true" ||
        group.panel.querySelector('[data-refused="true"]'),
    );
    value = (refused ?? groups[0])?.value ?? "";
    root.dataset.tabbed = "";
  });

  $effect(() => {
    for (const group of groups) group.panel.hidden = group.value !== value;
  });
</script>

{#if groups.length > 0}
  <Tabs bind:value color="blue">
    <TabList class="flex-wrap justify-start! px-0!">
      {#each groups as group (group.value)}
        <Tab value={group.value} id="{id}-tab-{group.value}" aria-controls={group.panel.id}
          >{group.title}</Tab
        >
      {/each}
    </TabList>
  </Tabs>
{/if}
