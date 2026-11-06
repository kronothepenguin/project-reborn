<script lang="ts">
  import { onMount } from "svelte";

  // Holo's openOrFocusHelp for a post's report flag: the report opens in the
  // Help Tool's own window, habbohelp, which comes forward when it is open.
  onMount(() => {
    const open = (event: MouseEvent) => {
      const flag = (event.target as HTMLElement).closest<HTMLAnchorElement>(".create-report-button");
      if (!flag) return;
      event.preventDefault();
      const size = screen.width >= 990 ? "width=980,height=597" : "width=740,height=597";
      const features = `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,${size}`;
      window.open(flag.href, "habbohelp", features)?.focus();
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  });
</script>
