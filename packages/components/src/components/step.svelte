<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLiAttributes } from "svelte/elements";

  // One step of a Stepper: a numbered point and its name, then an arrow to the
  // next step. With href it is a link, a step already passed; with current it
  // is highlighted and carries aria-current="step"; with neither it is plain
  // and faded, a step still to come. Under 640px only the current step shows
  // its name.
  interface Props extends HTMLLiAttributes {
    href?: string;
    current?: boolean;
    children: Snippet;
  }

  let { href, current = false, class: className, children, ...rest }: Props = $props();

  // The arrow after the step is a chevron drawn by ::after, hidden on the last.
  const item =
    "flex items-center gap-2 [counter-increment:step] max-sm:gap-1.5 after:size-2 after:shrink-0 after:rotate-45 after:border-t-2 after:border-r-2 after:border-sky-600 after:content-[''] last:after:hidden";
  const point =
    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold before:content-[counter(step)]";
</script>

<li {...rest} class={[item, className]}>
  {#if current}
    <span class="flex items-center gap-2" aria-current="step">
      <span class="{point} border-sky-700 bg-sky-700 text-white" aria-hidden="true"></span>
      <span class="font-bold whitespace-nowrap text-black">{@render children()}</span>
    </span>
  {:else if href}
    <a
      {href}
      class="group flex items-center gap-2 rounded-full text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <span
        class="{point} border-sky-600 bg-sky-600 text-white group-hover:border-sky-400 group-hover:bg-sky-400"
        aria-hidden="true"
      ></span>
      <span class="whitespace-nowrap underline-offset-2 group-hover:underline max-sm:sr-only"
        >{@render children()}</span
      >
    </a>
  {:else}
    <span class="flex items-center gap-2 text-neutral-500">
      <span class="{point} border-neutral-300 bg-white" aria-hidden="true"></span>
      <span class="whitespace-nowrap max-sm:sr-only">{@render children()}</span>
    </span>
  {/if}
</li>
