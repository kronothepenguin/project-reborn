<script lang="ts">
  import { onMount } from "svelte";

  // Holo's openOrFocusHabbo, for the header's Enter: a link aimed at client
  // opens the client page in the hotel's own window, which comes forward when
  // it already shows the client. A screen narrower than 990 pixels gets the
  // narrow window and the narrow client.
  onMount(() => {
    const open = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[target="client"]');
      if (!link) return;
      event.preventDefault();
      const address = new URL(link.href);
      if (screen.width < 990) address.searchParams.set("wide", "false");
      const size = screen.width >= 990 ? "width=980,height=597" : "width=740,height=597";
      const features = `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,${size}`;
      const hotel = window.open("", "client", features);
      if (!hotel) return;
      let showing = false;
      try {
        showing = hotel.location.pathname === address.pathname;
      } catch {}
      if (!showing) hotel.location.href = address.href;
      hotel.focus();
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  });
</script>
