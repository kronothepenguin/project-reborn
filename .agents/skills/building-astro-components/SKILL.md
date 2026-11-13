---
name: building-astro-components
description: Builds reusable static Astro components and layouts with typed props, slots and Tailwind classes, in lowercase kebab-case files. Use when creating, refactoring or reusing .astro layouts or UI components, or when deciding where a piece of static UI lives.
---

# Building Astro components

A component is a plain `.astro` file: markup and Tailwind classes, rendered on the server. A component that needs
state, events, browser APIs or `fetch` follows `adding-svelte-interactivity`.

The project's knowledge names the folders, the commands and the checks.

## Roles

- **Document layout**: the outer shell with `<html>`, `<head>` and `<body>`. It imports the global styles once.
- **Body layout**: the chrome inside `<body>`, such as navigation and columns. It renders the document layout and
  passes its slot through.
- **Component**: everything else, such as buttons, cards, forms, sections and specialized wrappers.

## Rules

1. Name files in lowercase kebab-case: `button.astro`, `primary-button.astro`.
2. Put every layout in `src/layouts/` and every other component in `src/components/`. Keep both flat; add sub-folders
   when the user asks.
3. Reuse an existing component first. Add a component for a real call site, and extract repeated markup on its second
   use. Build only the variants a call site uses.
4. Declare `interface Props`, destructure `Astro.props` and give defaults.
5. Compose: a component renders other components, and a specialized component renders its base component with set
   props and forwards its slot. Slots pass content; named slots (`<slot name="title" />`) pass regions.
6. Style with Tailwind utility classes inline.
7. A page renders one body layout. The body layout renders the document layout, the only file with `<html>`,
   `<head>` and `<body>`.

Read [daisyUI](https://daisyui.com/components/) and [shadcn](https://ui.shadcn.com/docs/components) for a component's
anatomy and variants. They are references, outside the dependencies.

## Layouts

```astro
---
// src/layouts/document.astro
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

A body layout has the same props and adds its chrome around the slot:

```astro
---
// src/layouts/app.astro
import Document from "./document.astro";

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<Document title={title}>
  <div class="mx-auto flex max-w-5xl gap-4 p-4">
    <nav class="w-48">...</nav>
    <main class="flex-1"><slot /></main>
  </div>
</Document>
```

A page imports its body layout:

```astro
---
import App from "../layouts/app.astro";
---

<App title="Profile">
  <h1>Hello</h1>
</App>
```

## Components

A base component with variants, `button.astro`:

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

<button {type} {disabled} class:list={["rounded px-4 py-1.5 text-sm font-bold", variants[variant]]}>
  <slot />
</button>
```

A specialized wrapper, `primary-button.astro`:

```astro
---
import Button from "./button.astro";

interface Props {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const { type, disabled } = Astro.props;
---

<Button variant="primary" {type} {disabled}><slot /></Button>
```

A composition, `login-card.astro`, filling the `title` slot of `card.astro`:

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

## Verify

Build the frontend and check that the built page holds the component's markup.

## Gotchas

- A layout lives in `src/layouts/`, also when a component renders a full section.
- A named slot goes on the element itself: `<span slot="title">Sign in</span>`.
- Astro forwards `class` and other attributes to the root element only through props. To let callers extend styles,
  destructure a `class` prop and add it with `class:list`.
