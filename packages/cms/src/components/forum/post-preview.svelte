<script lang="ts">
  import { Avatar, Button, GroupBadge, Icon } from "@project-reborn/components";
  import type { Viewer } from "./forum";

  // previewpost.php's box: the post as it will look in the habbo's own box, with
  // « Modify back to the form, and Cancel and Save. The habbo shows online while it is in the hotel, as its post
  // box will.
  interface Props {
    me: Viewer;
    title: string;
    html: string;
    date: string;
    saving: boolean;
    onmodify: () => void;
    oncancel: () => void;
    onsave: () => void;
  }

  let { me, title, html, date, saving, onmodify, oncancel, onsave }: Props = $props();
</script>

<table class="w-full border-collapse" aria-label="Preview">
  <tbody>
    <tr>
      <td class="w-[148px] px-1 py-1.5 align-top text-neutral-500">
        <a class="pl-[11px] align-super text-black underline" href={`/home?name=${encodeURIComponent(me.name)}`}>{me.name}</a><br />
        &nbsp;&nbsp;{#if me.online}<img class="inline" alt="Online" src="/myhabbo/habbo_online_anim.gif" />{:else}<img
            class="inline"
            alt="Offline"
            src="/myhabbo/habbo_offline.gif"
          />{/if}
        <div class="pl-[11px]">Messages: {me.messages}</div>
        <div class="flow-root">
          <div class="float-left">
            <Avatar imagingUrl={me.imaging} figure={me.figure} size="b" direction={2} headDirection={2} gesture="sml" alt={me.name} />
          </div>
          <div class="float-left h-10 w-[60px] pt-[23px] text-center">
            {#if me.group !== "0"}<a href={`/groups/${me.group}`}><GroupBadge class="inline" code={me.groupBadge} /></a>{/if}
          </div>
          <div class="float-left h-10 w-[60px] pt-1 text-center">
            {#if me.badge}<img class="inline" src={me.badge} alt="" />{/if}
          </div>
        </div>
        <div class="clear-both overflow-hidden pt-1 pl-[11px] break-words">{me.motto}</div>
      </td>
      <td class="overflow-hidden p-[9px] align-top break-words" colspan="2">
        <button type="button" class="float-right cursor-pointer text-neutral-400 hover:underline" onclick={onmodify}
          >&laquo; Modify</button
        >
        <span class="text-xs font-bold"> {title}</span><br />
        <span class="text-xs text-neutral-500">{date}</span>
        <div class="mt-2.5 w-[540px] overflow-hidden break-words">{@html html}</div>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
        <div class="flex gap-1">
          <Button variant="red" onclick={oncancel}><span class="flex items-center gap-1"><Icon variant="cancel" />Cancel</span></Button>
          <Button variant="green" disabled={saving} onclick={onsave}
            ><span class="flex items-center gap-1"><Icon variant="save" />Save</span></Button
          >
        </div>
      </td>
    </tr>
  </tbody>
</table>
