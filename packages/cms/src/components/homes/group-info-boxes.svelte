<script lang="ts">
  import { mount, onMount, unmount } from "svelte";
  import GroupInfoBox from "./group-info-box.svelte";

  // Holo's GroupsWidget script for every MY GROUPS widget of the playground,
  // those the editor places included: a click on a group swaps the list for the
  // group's info box, whose minus brings the list back. As in Holo, only a click
  // on a link itself follows it, so the badge opens the box.
  onMount(() => {
    const playground = document.getElementById("playground");
    if (!playground) return;
    const open = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const row = target.closest<HTMLElement>(".groups-list li");
      if (!row || target.nodeName === "A") return;
      event.preventDefault();
      const widget = row.closest(".groups-widget") as HTMLElement;
      const list = widget.querySelector(".groups-list-container") as HTMLElement;
      const holder = widget.querySelector(".groups-list-info") as HTMLElement;
      list.hidden = true;
      holder.hidden = false;
      const box = mount(GroupInfoBox, {
        target: holder,
        props: {
          group: row.dataset.group ?? "",
          onclose: () => {
            unmount(box);
            holder.hidden = true;
            list.hidden = false;
          },
        },
      });
    };
    playground.addEventListener("click", open);
    return () => playground.removeEventListener("click", open);
  });
</script>
