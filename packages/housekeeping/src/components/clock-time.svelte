<script lang="ts">
  // A date and a time that tick every second. Without now it shows the
  // visitor's local time. With now, the server's milliseconds when Go wrote the
  // page, it shows the server's time in UTC.
  interface Props {
    now?: number | string;
  }

  let { now }: Props = $props();

  const server = now !== undefined;
  const offset = server ? Number(now) - Date.now() : 0;
  const prefix = server ? "clock-server" : "clock-local";

  let at = $state(new Date(Date.now() + offset));

  $effect(() => {
    const timer = setInterval(() => (at = new Date(Date.now() + offset)), 1000);
    return () => clearInterval(timer);
  });

  function date(value: Date, timeZone?: string) {
    return value.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone });
  }
</script>

{#if server}
  <p id="{prefix}-date">{date(at, "UTC")}</p>
  <p id="{prefix}-time">{at.toLocaleTimeString("en-GB", { timeZone: "UTC" })} GMT+0000 (UTC)</p>
{:else}
  <p id="{prefix}-date">{date(at)}</p>
  <p id="{prefix}-time">{at.toTimeString()}</p>
{/if}
