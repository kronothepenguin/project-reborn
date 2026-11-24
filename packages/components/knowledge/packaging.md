---
type: Reference
title: Packaging and Tailwind
description: How the components ship as Svelte source and how an app picks up their Tailwind classes.
---

# Packaging

Components are authored with Svelte 5 and ship as Svelte source through the package `exports` map (`src/index.ts`), so
a consuming app compiles them with its own Svelte toolchain. `svelte` `^5` is a peer dependency, provided by the app.

# Tailwind

Components carry plain Tailwind utility classes. `src/styles.css` registers the package source with `@source "./"`,
and the app imports it after Tailwind in its own CSS entry:

```css
/* packages/<app>/src/styles/global.css */
@import "tailwindcss" source("../..");
@import "@project-reborn/components/styles.css";
```

`source("../..")` makes the app's own folder the root of Tailwind's scan, whichever dev server compiles the file: its
own, or reborn's dev server (`packages/reborn/knowledge/dev-server.md`).

The app keeps its own theme and tokens; the design system contributes the classes the app's build emits.

`src/styles.css` imports `src/styles/shades.css`, the new shades of Tailwind's palette that hold Holo's colours beyond
the margin, such as `--color-red-550: #d64242`. Every app, the components' tests and Storybook get them through that
import, so `bg-red-550` works everywhere. `tools/tw-color` proposes and writes the shades
(`knowledge/colours.md`).

# Use

```svelte
<script lang="ts">
  import { Button, FormField, Input } from "@project-reborn/components";
</script>

<FormField label="Username">
  <Input name="username" />
</FormField>
<Button type="submit">Sign in</Button>
```
