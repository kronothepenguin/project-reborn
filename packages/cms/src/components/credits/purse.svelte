<script lang="ts">
  import { Button, Icon, Input, Link, Notice } from "@project-reborn/components";
  import { onMount } from "svelte";

  // fullcontent.js's PurseHabblet: Submit, or Enter in the field, sends the code,
  // and redeemvoucher.php's answer takes the purse's place without the field, so
  // that another code waits for the page to load again. source holds the balance.
  interface Props {
    source: string;
  }

  let { source }: Props = $props();

  const uid = $props.id();

  let credits = $state(0);
  let code = $state("");
  let redeeming = $state(false);
  let answer = $state<{ ok: boolean; message: string } | null>(null);

  onMount(() => {
    credits = Number((document.getElementById(source) as HTMLElement).dataset.credits);
  });

  async function redeem(event: SubmitEvent) {
    event.preventDefault();
    if (redeeming) return;
    redeeming = true;
    try {
      const response = await fetch("/credits/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json()) as { credits: number; message: string };
      credits = body.credits;
      answer = { ok: response.ok, message: body.message };
    } catch {
      answer = { ok: false, message: "An unknown error occurred. Please try again in a couple of minutes." };
    } finally {
      redeeming = false;
    }
  }
</script>

<form onsubmit={redeem}>
  <ul class="pt-3.5">
    <li
      class="bg-olive-200 bg-[url(/web-gallery/images/purse/purse_icon.gif)] bg-position-[22px_9px] bg-no-repeat pt-2.5 pb-[15px] pl-[60px]"
    >
      <div>You Currently Have:</div>
      <span class="text-lg font-bold">{credits} Credits</span>
      <div class="text-sm"><Link href="/credits/transactions">Account transactions</Link></div>
    </li>
    {#if !answer}
      <li>
        <div class="flow-root py-2.5">
          <label class="block" for="{uid}-code">Enter redemption code:</label>
          <span class="float-left w-51.5 [&>input]:w-full">
            <Input id="{uid}-code" name="voucherCode" variant="border" bind:value={code} />
          </span>
          <span class="float-left mb-1.5 ml-3.5">
            <Button type="submit" disabled={redeeming}
              ><span class="flex items-center gap-1.5"><Icon variant="purse" />Submit</span></Button
            >
          </span>
        </div>
      </li>
    {/if}
  </ul>
  <div class="clear-both px-5 pt-2.5 text-center">
    {#if answer}
      <Notice variant={answer.ok ? "green" : "red"}>{answer.message}</Notice>
    {/if}
  </div>
</form>
