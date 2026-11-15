---
name: adding-svelte-interactivity
description: Builds the Svelte 5 islands of an app, in its feature folders, and promotes Astro components to Svelte, when UI needs client state, events, browser APIs or fetch, hydrated with client:only="svelte". Use when a component must react to the user in the browser, call a Go endpoint, or move from .astro to .svelte.
---

# Adding Svelte interactivity

An island is a Svelte component of an app that runs in the browser. Code that runs in the browser lives in an island,
an inline `<script>` included: a ticking clock is an island. An `.astro` file holds markup only, and every layout
stays `.astro`, as `building-astro-components` says.

An island lives in its feature's sub-folder of `src/components/`, next to the `.astro` components
(`src/components/orders/order-filter.svelte`). A piece that knows no app is a primitive of the shared components
package from the start, also while one app uses it: `building-svelte-primitives` builds it.

The project's knowledge names the folders, the commands and the checks.

## Pick the file

| The component | File | Directive where it is used |
| --- | --- | --- |
| Renders markup and props | `.astro` | none |
| Svelte component with no client behaviour | `.svelte` | none: server-rendered, static |
| Holds state, events, browser APIs or `fetch` | `.svelte` | `client:only="svelte"` |

- State (`$state`), event handlers (`onclick`, `onsubmit`) and `bind:value` belong in `.svelte`.
- `client:only="svelte"` renders the island in the browser only. Keep critical and indexable content in the
  surrounding `.astro` markup.

## Promote an `.astro` component

Do every step in one change:

1. Rename `orders/order-row.astro` to `orders/order-row.svelte`.
2. Port the frontmatter to runes: `Astro.props` → `let { ... } = $props()`, mutable values → `$state(...)`, computed
   values → `$derived(...)`, side effects → `$effect(...)`.
3. Port the template: `class:list` → a `class` value; `<slot />` → `let { children } = $props()` and
   `{@render children?.()}`.
4. Port an inline `<script>`: DOM lookups → state and markup, timers and listeners → `$effect(...)` with a cleanup.
5. Update every import to `order-row.svelte` and add `client:only="svelte"` at each usage.
6. Delete the `.astro` file.

```svelte
<!-- src/components/orders/poke-button.svelte -->
<script lang="ts">
  import { Button } from "@acme/components";

  let { label = "Click me" } = $props();
  let count = $state(0);
</script>

<Button onclick={() => count++}>{label} ({count})</Button>
```

```astro
---
import PokeButton from "../components/orders/poke-button.svelte";
---

<PokeButton client:only="svelte" label="Poke" />
```

## Svelte 5

- Write `<script lang="ts">` with runes: `$props`, `$state`, `$derived`, `$effect`.
- Declare props once with `$props()`, in place of `export let`.
- Write events as attributes: `onclick={...}`, `onsubmit={...}`, in place of `on:click`.
- Bind form values with `bind:value`.

## Data from Go

An island fetches its data from the Go endpoints on the same server, with JSON requests and responses, or reads it
from the page's markup as `templating-astro-pages` says. The endpoint is an ordinary action route that decodes JSON and
answers 2xx; `applying-go-patterns` owns it.

```svelte
<!-- src/components/messages/message-sender.svelte -->
<script lang="ts">
  import { Button, Input } from "@acme/components";

  let { endpoint = "/messages" } = $props();

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
      status = res.ok ? "sent" : "error";
      if (res.ok) message = "";
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
  <Input bind:value={message} />
  <Button type="submit" disabled={status === "sending"}>Send</Button>
</form>

{#if status === "sent"}
  <p class="text-sm text-green-700">Sent.</p>
{:else if status === "error"}
  <p class="text-sm text-red-700">Something went wrong.</p>
{/if}
```

## Verify

1. Build the frontend and check that the built page holds `client="only"` for the island.
2. Run the program, use the island, and check that its request reaches the Go handler.

## Gotchas

- Give every interactive `.svelte` component `client:only="svelte"` where it is used. Without the directive it renders
  as static HTML and its event handlers stay inert.
