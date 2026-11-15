# @project-reborn/components

The project's design system: a reusable set of Svelte 5 UI components shared across the project's
applications.

How it works: `knowledge/index.md`.

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

## Tooling

| Command | Purpose |
|---|---|
| `pnpm --filter @project-reborn/components dev` | Storybook dev server (the catalogue) at http://localhost:6006 |
| `pnpm --filter @project-reborn/components build-storybook` | Build the static catalogue |
| `make check`, from `packages/components` | Run the `check` script (`svelte-check`) and the `test` script (Vitest browser mode, in Playwright's chromium) |