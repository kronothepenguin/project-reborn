---
name: building-astro-components
description: Builds reusable static Astro components and layouts with typed props, slots, and Tailwind styling, using lowercase kebab-case filenames. Use when creating, refactoring, or reusing .astro layouts or UI components.
---

# Building Astro components

Static, server-rendered UI is split by role:

- `src/layouts/` — all layouts. There are two roles, both here:
  - **Document layout** — the outermost shell: `<html>`, `<head>`, `<body>`. A page renders exactly one.
  - **Body layout** — structures content inside `<body>` (public vs signed-in chrome, navigation, columns). It renders a document layout and passes its slot through.
- `src/components/` — everything else: buttons, cards, forms, sections, specialized wrappers.

Every file is a plain `.astro` file: markup plus Tailwind classes, no client JavaScript.

## Rules

1. **File name**: lowercase kebab-case (`button.astro`, `signed-in.astro`, `primary-button.astro`). Never PascalCase.
2. **Location**: document and body layouts in `src/layouts/`; everything else in `src/components/`. Keep both flat; group into subfolders only when the user asks.
3. **YAGNI**: reuse an existing component before writing a new one. Add a component only when it has a real call site or a second use appears. Never implement a whole catalog up front.
4. **Typed props**: declare `interface Props`, destructure `Astro.props`, and give defaults.
5. **Composition**: a component may import and render other components, and a body layout may render a document layout. Prefer composing `button.astro` + `card.astro` over duplicating their markup. Slots pass content; named slots (`<slot name="title" />`) pass regions.
6. **Styling**: Tailwind utility classes inline. Global styles are imported once, by the document layout.
7. **Interactivity**: if a component needs state, events, browser APIs, or `fetch`, stop and use the `adding-svelte-interactivity` skill. A `.astro` component holds no client behavior.

Use [daisyUI](https://daisyui.com/components/) and [shadcn](https://ui.shadcn.com/docs/components) as references for component anatomy and variants. They are guides, not dependencies and not a checklist: implement only the variant a call site needs.

## Layouts

A page renders one body layout. The body layout renders the document layout. Only the document layout contains `<html>`, `<head>`, and `<body>`.

`src/layouts/document.astro`:

```astro
---
import "../styles/global.css";

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

Body layouts use the same shape and differ only in the chrome around the slot. A signed-out page such as the landing page:

`src/layouts/signed-out.astro`:

```astro
---
import Document from "./document.astro";

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<Document title={title}>
  <div class="mx-auto max-w-3xl p-4">
    <slot />
  </div>
</Document>
```

Signed-in pages add the application chrome:

`src/layouts/signed-in.astro`:

```astro
---
import Document from "./document.astro";

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<Document title={title}>
  <div class="mx-auto flex max-w-5xl gap-4 p-4">
    <nav class="w-48">...</nav>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</Document>
```

A page imports the body layout, never the document layout:

```astro
---
import SignedIn from "../layouts/signed-in.astro";
---

<SignedIn title="Me">
  <h1>Hello</h1>
</SignedIn>
```

## Base component: `button.astro`

```astro
---
interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const { type = "button", variant = "secondary", disabled = false } = Astro.props;

const variants = {
  primary: "bg-sky-600 text-white hover:bg-sky-700",
  secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
};
---

<button
  type={type}
  disabled={disabled}
  class:list={["rounded px-4 py-1.5 text-sm font-bold", variants[variant]]}
>
  <slot />
</button>
```

## Specialized wrapper: `primary-button.astro`

A specialized component sets the base component's props and forwards its own slot. Do not copy the base markup.

```astro
---
import Button from "./button.astro";

interface Props {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const { type, disabled } = Astro.props;
---

<Button variant="primary" {type} {disabled}>
  <slot />
</Button>
```

## Composition: `login-card.astro`

Components can use components. `card.astro` provides the frame and a `title` named slot.

```astro
---
import Card from "./card.astro";
import PrimaryButton from "./primary-button.astro";
---

<Card>
  <span slot="title">Sign in</span>
  <form method="post" class="flex flex-col gap-2 p-3">
    <slot />
    <PrimaryButton type="submit">Sign in</PrimaryButton>
  </form>
</Card>
```

Usage passes named slot content with the `slot` attribute on the element:

```astro
<LoginCard>
  <label class="text-xs">
    Username
    <input name="username" class="rounded border border-zinc-500 px-2 py-1" />
  </label>
</LoginCard>
```

## Verification

Run from the frontend package:

```sh
pnpm build
```

Then confirm the rendered markup in `dist/<page>.html` contains the component output.

## Gotchas

- `.astro` components are server-only: they cannot hold `$state`, `onclick`, `onsubmit`, or `bind:value`. Those belong to Svelte.
- Only the document layout contains `<html>`/`<head>`/`<body>`. A body layout that emits those tags breaks nesting.
- Layouts never live in `src/components/`, even when a component renders a full section.
- `class` and other attributes passed to a component are not forwarded to the root element. Destructure a `class` prop and use `class:list` if callers need to extend styles.
- Named slot usage puts `slot="name"` on the element, not inside it: `<span slot="title">Sign in</span>`.
- A one-off inline `<div>` is fine until it repeats. Extract on the second real use, not the first.
