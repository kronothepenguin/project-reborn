<script lang="ts">
  import { onMount } from "svelte";

  // Holo's openOrFocusHelp, for the header's Help and the posts' report flags:
  // a link aimed at habbohelp opens in the Help Tool's own window, which comes
  // forward when it is open. Holo never set the habboHelp flag it checked for,
  // so the window always loads the link.
  onMount(() => {
    const open = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[target="habbohelp"]');
      if (!link) return;
      event.preventDefault();
      const size = screen.width >= 990 ? "width=980,height=597" : "width=740,height=597";
      const features = `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,${size}`;
      window.open(link.href, "habbohelp", features)?.focus();
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  });
</script>
