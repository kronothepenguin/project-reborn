# @project-reborn/components

The project's design system: a reusable set of UI components shared across the project's
applications. Components are authored with Svelte 5 and ship as Svelte source through the
package `exports` map, so a consuming app compiles them with its own Svelte toolchain.

## Install

Declare a workspace dependency in the consuming app and install:

```jsonc
// packages/<app>/package.json
"dependencies": {
  "@project-reborn/components": "workspace:*"
}
```

```sh
pnpm install
```

`svelte` `^5` is a peer dependency and is provided by the consuming app.

## Tailwind

Components carry plain Tailwind utility classes. Tailwind 4 is CSS-first, so register the
package source in the app's own Tailwind entry:

```css
/* the app's CSS entry, e.g. packages/<app>/src/styles/global.css */
@import "tailwindcss";
@source "../../packages/components/src";
```

The app keeps its own theme and tokens; the design system contributes the classes the app's
build emits. No Tailwind config inheritance or presets are required.

## Use

```svelte
<script lang="ts">
  import { Button, FormField, Input } from "@project-reborn/components";
</script>

<FormField label="Username">
  <Input name="username" />
</FormField>
<Button type="submit">Sign in</Button>
```

## Tooling

| Command | Purpose |
|---|---|
| `pnpm --filter @project-reborn/components dev` | Storybook dev server (the catalogue) at http://localhost:6006 |
| `pnpm --filter @project-reborn/components build-storybook` | Build the static catalogue |
| `pnpm --filter @project-reborn/components test` | Run component behaviour tests (Vitest browser mode) |
| `pnpm --filter @project-reborn/components check` | `svelte-check` type/compile check |