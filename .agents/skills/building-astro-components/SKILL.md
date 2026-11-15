---
name: building-astro-components
description: Builds static Astro components and layouts with typed props, slots and Tailwind classes, composed from the shared Svelte primitives, in lowercase kebab-case files in feature folders. Use when creating, refactoring or reusing .astro layouts or UI components, or when deciding where a piece of static UI lives.
---

# Building Astro components

A component is a plain `.astro` file: markup and Tailwind classes, rendered on the server. An `.astro` file holds
markup only. Code that runs in the browser, an inline `<script>` included, lives in a Svelte island, as
`adding-svelte-interactivity` says: a ticking clock is an island.

The project's knowledge names the folders, the shared components package, the commands and the checks.

## Roles

- **Document layout**: the outer shell with `<html>`, `<head>` and `<body>`. It imports the global styles once.
- **Body layout**: the chrome inside `<body>`, such as navigation and columns. It renders the document layout, passes
  its slot through, and renders the islands of its chrome, such as a header menu.
- **Primitive**: a button, card, input, table or dialog. It is a Svelte component of the project's shared components
  package; `building-svelte-primitives` builds one.
- **Component**: the app's own markup, such as a form, a section or a list. It composes primitives.

## Rules

1. Name files in lowercase kebab-case: `order-list.astro`.
2. Put every layout flat in `src/layouts/`. Put a component that one feature uses in that feature's sub-folder of
   `src/components/` (`src/components/orders/order-list.astro`). Put a component that several features use at the root
   of `src/components/`.
3. Reuse first: a primitive of the shared package, then a component of the app. Add a component for a real call site,
   and extract repeated markup on its second use. Build only the variants a call site uses.
4. Declare `interface Props`, destructure `Astro.props` and give defaults.
5. Compose: a component renders primitives and other components, and holds the app's own markup. Slots pass content;
   named slots (`<span slot="header">`) pass regions.
6. Style with Tailwind utility classes inline.
7. A page renders one body layout. A page with no chrome, such as a maintenance page, renders the document layout
   directly. The document layout is the only file with `<html>`, `<head>` and `<body>`.

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

A body layout has the same props and adds its chrome around the slot, with the islands of that chrome:

```astro
---
// src/layouts/app.astro
import AccountMenu from "../components/header/account-menu.svelte";
import Document from "./document.astro";

interface Props {
  title?: string;
}

const { title } = Astro.props;
---

<Document title={title}>
  <header class="flex justify-end p-2"><AccountMenu client:only="svelte" /></header>
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

A component of one feature, `src/components/orders/order-summary.astro`, composes primitives of the shared package:

```astro
---
import { Button, Card } from "@acme/components";

interface Props {
  number: string;
  total: string;
}

const { number, total } = Astro.props;
---

<Card>
  <span slot="header">Order {number}</span>
  <form method="post" class="flex items-center justify-between gap-2">
    <p class="text-sm">Total: {total}</p>
    <Button type="submit">Pay</Button>
  </form>
</Card>
```

A component of several features, `src/components/sign-in-card.astro`, forwards its slot:

```astro
---
import { Button, Card, Input } from "@acme/components";
---

<Card>
  <span slot="header">Sign in</span>
  <form method="post" class="flex flex-col gap-2">
    <Input name="username" />
    <Input name="password" type="password" />
    <slot />
    <Button type="submit">Sign in</Button>
  </form>
</Card>
```

## Verify

Build the frontend and check that the built page holds the component's markup.

## Gotchas

- A layout lives in `src/layouts/`, also when a component renders a full section.
- A named slot goes on the element itself: `<span slot="header">Sign in</span>`. A Svelte primitive receives it as
  the snippet of the same name.
- Astro forwards `class` and other attributes to the root element only through props. To let callers extend styles,
  destructure a `class` prop and add it with `class:list`.
