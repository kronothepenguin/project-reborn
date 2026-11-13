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
@import "tailwindcss";
@import "@project-reborn/components/styles.css";
```

The app keeps its own theme and tokens; the design system contributes the classes the app's build emits.

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
