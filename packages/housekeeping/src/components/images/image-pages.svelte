<script lang="ts">
  import { onMount } from "svelte";

  // The server renders every upload into the tbody named list, and this shows
  // ten of its rows at a time (0080). The page lives in the address, and each
  // delete form carries it, so that the answer to a delete returns to it.
  interface Props {
    list: string;
  }

  const perPage = 10;
  const path = "/housekeeping/images";
  const link = "text-blue-925 underline";

  let { list }: Props = $props();

  let rows: HTMLTableRowElement[] = [];
  let forms: HTMLFormElement[] = [];
  let last = $state(1);
  let current = $state(1);

  function requested(): number {
    const page = Number(new URLSearchParams(location.search).get("page"));
    return Number.isInteger(page) && page >= 1 ? Math.min(page, last) : 1;
  }

  function show(page: number) {
    current = page;
    rows.forEach((row, i) => {
      row.hidden = Math.floor(i / perPage) + 1 !== page;
    });
    for (const form of forms) {
      const action = new URL(form.action);
      action.searchParams.set("page", String(page));
      form.action = action.pathname + action.search;
    }
  }

  function turn(event: MouseEvent, page: number) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, "", `${path}?page=${page}`);
    show(page);
    scrollTo(0, 0);
  }

  onMount(() => {
    const body = document.getElementById(list) as HTMLTableSectionElement;
    rows = Array.from(body.rows);
    forms = Array.from(body.querySelectorAll("form"));
    last = Math.max(Math.ceil(rows.length / perPage), 1);
    show(requested());
    const back = () => show(requested());
    addEventListener("popstate", back);
    return () => removeEventListener("popstate", back);
  });
</script>

{#if last > 1}
  <p class="mt-2 text-center">
    {#if current > 1}<a href="{path}?page={current - 1}" class={link} onclick={(event) => turn(event, current - 1)}>Newer</a>{/if} {#if current < last}<a href="{path}?page={current + 1}" class={link} onclick={(event) => turn(event, current + 1)}>Older</a>{/if}
  </p>
{/if}
