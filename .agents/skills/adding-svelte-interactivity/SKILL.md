---
name: adding-svelte-interactivity
description: Promotes Astro components to Svelte 5 when they need client state, events, browser APIs, or fetch, using client:only="svelte". Use when a component must react to the user in the browser or when moving a .astro component to .svelte.
---

# Adding Svelte interactivity

Svelte is used only for UI that runs in the browser. Static markup stays in `.astro` (see `building-astro-components`). Interactive `.svelte` files live in `src/components/`, next to their `.astro` peers. Layouts stay `.astro`: document and body shells have no client behavior.

## When to use which

| Component behavior | Implementation | Directive in Astro |
| --- | --- | --- |
| Renders markup/props only | `.astro` | n/a |
| Svelte component with no client behavior | `.svelte` | none (server-rendered, not hydrated) |
| State, events, browser APIs, `fetch` | `.svelte` | `client:only="svelte"` |

`client:only="svelte"` skips server rendering, so the component renders only after JavaScript loads. Keep any critical or indexable content in the surrounding `.astro` markup.

## Promoting an `.astro` component to `.svelte`

Do all five steps in one change; never leave a duplicate `.astro` file behind.

1. Rename `button.astro` → `button.svelte`.
2. Port the frontmatter to Svelte 5 runes:
   - `Astro.props` → `let { ... } = $props()`
   - local mutable values → `let x = $state(...)`
   - computed values → `$derived(...)`
   - side effects → `$effect(...)`
3. Replace Astro template constructs with Svelte ones (`class:list` → a `class` value; `<slot />` → `let { children } = $props()` plus `{@render children?.()}`).
4. Update every import and usage: `./button.astro` → `./button.svelte`, and add `client:only="svelte"` at each usage.
5. Delete the old `.astro` file.

Before (static `.astro`, cannot track clicks):

```astro
---
interface Props {
  label?: string;
}

const { label = "Click me" } = Astro.props;
---

<button class="rounded bg-sky-600 px-4 py-1.5 text-sm font-bold text-white">
  {label}
</button>
```

After (`interactive-button.svelte`):

```svelte
<script lang="ts">
  let { label = "Click me" } = $props();
  let count = $state(0);
</script>

<button
  class="rounded bg-sky-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-sky-700"
  onclick={() => count++}
>
  {label} ({count})
</button>
```

Usage with hydration:

```astro
---
import InteractiveButton from "../components/interactive-button.svelte";
---

<InteractiveButton client:only="svelte" label="Poke" />
```

## Svelte 5 rules

- `<script lang="ts">` with runes: `$props`, `$state`, `$derived`, `$effect`.
- Events are attributes: `onclick={...}`, `onsubmit={...}`. Never `on:click`.
- Two-way binding uses `bind:value`. Never `export let`.
- Props are declared once with `$props()`; do not mix in `export let`.

## Fetching data from Go

Client components get data by calling the Go endpoints registered on the same mux, not from `[[ ]]` placeholders. Requests and responses use JSON.

`message-sender.svelte`:

```svelte
<script lang="ts">
  let { endpoint = "/me/message" } = $props();

  let message = $state("");
  let status = $state<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    status = "sending";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        message = "";
        status = "sent";
      } else {
        status = "error";
      }
    } catch {
      status = "error";
    }
  }
</script>

<form
  class="flex gap-2"
  onsubmit={(event) => {
    event.preventDefault();
    send();
  }}
>
  <input class="rounded border border-zinc-500 px-2 py-1" bind:value={message} />
  <button
    type="submit"
    class="rounded bg-sky-600 px-4 py-1.5 font-bold text-white"
    disabled={status === "sending"}
  >
    Send
  </button>
</form>

{#if status === "sent"}
  <p class="mt-1 text-sm text-green-700">Sent.</p>
{:else if status === "error"}
  <p class="mt-1 text-sm text-red-700">Something went wrong.</p>
{/if}
```

Use in a page with hydration:

```astro
---
import MessageSender from "../components/message-sender.svelte";
---

<MessageSender client:only="svelte" endpoint="/me/message" />
```

The matching Go handler is an ordinary action route (`POST /me/message` → `me-message.go`, `HandleMeMessage`) that decodes JSON and returns a 2xx status. See `applying-go-patterns`.

## Verification

Run from the frontend package:

```sh
pnpm build
grep -o 'client="only"' dist/<page>.html
```

The built HTML must contain `client="only"` for the component. Then run the app and exercise the interaction; confirm the request reaches the Go handler.

## Gotchas

- A `.svelte` component rendered without `client:only` is server-rendered and never hydrated: its event handlers silently do nothing. Add the directive whenever the component is interactive.
- `[[ .Field ]]` inside a `.svelte` `<script>` is never substituted; JS bundles are not parsed by `html/template`. Pass server data through HTML or fetch it.
- Props passed with `[[ ]]` must be simple scalars. Quotes or backslashes in the value corrupt the serialized props JSON and hydration throws. Prefer fetching such data.
