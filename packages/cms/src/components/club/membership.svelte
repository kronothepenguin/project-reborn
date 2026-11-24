<script lang="ts">
  import { Button, Card, Dialog, Spinner } from "@project-reborn/components";
  import { onMount } from "svelte";

  // club.php's My Membership box. A buy button opens habboclub.js's dialog with
  // club_confirm.php's question, Buy sends club_subscribe.php's purchase and shows
  // its answer, and the box then shows the club again, as ajax_club.php did.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  type Answer = {
    months?: number;
    error?: string;
    maxMonths?: number;
    days: number;
    credits: number;
  };
  // A session that ended gets the words of Holo's club pages for a guest.
  type Result = { name: "subscribe"; message: string } | { name: "signedOut" } | { name: "unknown" };

  const piccolo = "/web-gallery/album1/piccolo_happy.gif";
  const options = [1, 3, 6];

  let shortName = $state("");
  let days = $state(0);
  let credits = $state(0);
  let daysPerMonth = $state(0);
  let prices = $state<Record<number, number>>({});
  // Holo drew the buttons from the purse the page was loaded with, and kept them.
  let canBuy = $state(false);
  let months = $state(0);
  let sending = $state(false);
  let result = $state<Result | null>(null);

  onMount(() => {
    const data = (document.getElementById(source) as HTMLElement).dataset;
    shortName = data.shortName ?? "";
    days = Number(data.days);
    credits = Number(data.credits);
    daysPerMonth = Number(data.daysPerMonth);
    prices = { 1: Number(data.price1), 3: Number(data.price3), 6: Number(data.price6) };
    canBuy = credits >= prices[1];
  });

  const title = $derived(`${shortName.toUpperCase()} CLUB`);

  function words(answer: Answer): string | null {
    switch (answer.error) {
      case undefined:
        return answer.months ? `Congratulations! You have successfully subscribed to ${shortName} Club for ${answer.months} month(s).` : null;
      case "credits":
        return "You don't have enough credits to complete the subscription purchase.";
      case "limit":
        return `You can only subscribe for a maximum of ${answer.maxMonths} months. If this subscription was completed, you would have exceeded the limit.`;
    }
    return null;
  }

  function close() {
    months = 0;
    result = null;
  }

  async function buy() {
    sending = true;
    const response = await fetch("/club/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ months }),
    }).catch(() => null);
    const answer =
      response?.ok || response?.status === 422 ? ((await response.json().catch(() => null)) as Answer | null) : null;
    const message = answer && words(answer);
    sending = false;
    months = 0;
    if (response?.status === 401) {
      result = { name: "signedOut" };
    } else if (answer && message) {
      days = answer.days;
      credits = answer.credits;
      result = { name: "subscribe", message };
    } else {
      result = { name: "unknown" };
    }
  }
</script>

<!-- Holo's two parts of the box reach its borders, past the card's padding. -->
<div class="-mx-4 -mt-2 -mb-0.5">
  <div class="px-[15px] py-2">
    <p class="pb-[1em]">You are{days > 0 ? "" : " not"} a member of {shortName} Club</p>
    <p class="pb-[1em]">
      {#if days > 0}You have {days} Club Day(s) left{:else}&nbsp;{/if}
    </p>
  </div>
  <div class="bg-amber-100 bg-[url(/web-gallery/v2/images/hc_pattern.gif)] bg-position-[30%] px-[15px] py-2">
    <div class="mx-1 rounded-lg bg-red-550 p-2">
      {#if canBuy}
        <table class="border-separate border-spacing-0.5">
          <tbody>
            {#each options as option (option)}
              <tr>
                <td class="p-px">
                  <div class="mb-1 ml-2.5 *:w-full">
                    <Button onclick={() => (months = option)}>Buy {option} {option === 1 ? "month" : "months"}</Button>
                  </div>
                </td>
                <td class="p-px">&nbsp;{prices[option]} Credits</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="pb-[1em] text-white">
          To join {shortName} Club you first need to buy some Credits; {shortName} Club membership starts from {prices[1]} credits
        </p>
        <div class="*:w-full"><Button href="/credits">Get some credits</Button></div>
      {/if}
    </div>
  </div>
</div>

{#snippet header()}
  <span class="relative block">
    {title}
    <button type="button" class="absolute top-0 right-0 cursor-pointer px-1" aria-label="Close" onclick={close}>X</button>
  </span>
{/snippet}

<Dialog open={months > 0} label={title} class="m-auto w-[398px] bg-transparent backdrop:bg-black/40" onclose={() => (months = 0)}>
  <Card color="orange" {header}>
    <div class="flow-root text-xs">
      {#if sending}
        <div class="py-2 text-center"><Spinner /></div>
      {:else}
        <img class="float-left m-2.5" src={piccolo} width="32" height="87" alt="" />
        <p class="pb-[1em]"><b>Confirm</b></p>
        <p class="pb-[1em]">
          {months} month(s) of {shortName} Club ({months * daysPerMonth} days) costs {prices[months]} Credits. You have: {credits}
          Credits.
        </p>
        <p class="flex gap-1 pb-[1em]">
          <Button onclick={close}>Cancel</Button>
          <Button onclick={buy}>Buy</Button>
        </p>
      {/if}
    </div>
  </Card>
</Dialog>

<Dialog open={result !== null} label={title} class="m-auto w-[398px] bg-transparent backdrop:bg-black/40" onclose={() => (result = null)}>
  <Card color="orange" {header}>
    <div class="flow-root text-xs">
      {#if result?.name === "subscribe"}
        <img class="float-left m-2.5" src={piccolo} width="32" height="87" alt="" />
        <p class="pb-[1em]"><b>Subscribe</b></p>
        <p class="pb-[1em]">{result.message}</p>
        <p class="pb-[1em]"><Button onclick={close}>Done</Button></p>
      {:else if result?.name === "signedOut"}
        <p class="pb-[1em]">Please log in first.</p>
        <p class="pb-[1em]"><Button onclick={close}>Done</Button></p>
      {:else}
        <p class="pb-[1em]">An unknown error occurred. Please try again in a couple of minutes.</p>
        <p class="pb-[1em]"><Button onclick={close}>OK</Button></p>
      {/if}
    </div>
  </Card>
</Dialog>
