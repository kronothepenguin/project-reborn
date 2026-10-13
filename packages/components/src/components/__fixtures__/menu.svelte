<script lang="ts">
  import MenuItem from "../menu-item.svelte";
  import Menu from "../menu.svelte";

  interface Item {
    value: string;
    label: string;
    disabled?: boolean;
    selected?: boolean;
  }

  interface Props {
    label?: string;
    disabled?: boolean;
    items?: Item[];
    onselect?: (value: string) => void;
  }

  let {
    label = "Menu",
    disabled = false,
    items = [],
    onselect,
  }: Props = $props();
</script>

<Menu {label} {disabled} {onselect}>
  {#each items as item (item.value)}
    <MenuItem
      value={item.value}
      disabled={item.disabled}
      selected={item.selected}
    >
      {item.label}
    </MenuItem>
  {/each}
</Menu>
