# Contract: Package and Consumption

How an application installs and uses the design system. This is the integration contract; changing it is a breaking change for consumers.

## Identity

| Field | Value |
|---|---|
| name | `@project-reborn/components` |
| location | `packages/components` (pnpm workspace member) |
| type | `module` |
| private | `true` (consumed inside the monorepo; not published) |
| engines.node | `>=22.12.0` (matches `packages/cms`) |
| package manager | `pnpm` |

## Distribution

The package ships **Svelte source**; there is no library build in Slice 1.

| Export | Target |
|---|---|
| `.` | `./src/index.ts` — re-exports every component and its types |
| `./styles.css` | `./src/styles.css` — Tailwind entry used by Storybook/tests |

`src/index.ts` re-exports each component from `src/components/*.svelte` and any public types from `src/context.ts`.

## Peer dependency

| Package | Range | Why |
|---|---|---|
| `svelte` | `^5` | The consuming app provides the Svelte runtime and compiles the source. |

## Tailwind consumption contract

Components use Tailwind utility classes. Tailwind 4 is CSS-first, so a consuming app registers the package's source in its own Tailwind entry:

```css
/* the app's CSS entry, e.g. packages/<app>/src/styles/global.css */
@import "tailwindcss";
@source "../../packages/components/src";
```

The app keeps its own theme/tokens; the design system contributes classes for the app's build to emit. No Tailwind config inheritance or presets are required.

## Workspace install (per constitution: pnpm, `@project-reborn` scope)

An app declares a workspace dependency and imports components:

```jsonc
// packages/<app>/package.json
"dependencies": {
  "@project-reborn/components": "workspace:*"
}
```

```svelte
<script lang="ts">
  import { Button, Dialog } from "@project-reborn/components";
</script>
```

## Scripts (the package's own tooling)

| Script | Command | Purpose |
|---|---|---|
| `dev` / `storybook` | `storybook dev -p 6006` | Storybook dev server (the catalogue) |
| `build-storybook` | `storybook build` | Static catalogue; Slice 1 acceptance build |
| `test` | `vitest run` | Component behaviour tests (browser mode) |
| `check` | `svelte-check --tsconfig ./tsconfig.json` | Type/compile check |

## Gates

Slice 1 is accepted when `pnpm --filter @project-reborn/components test` passes and `pnpm --filter @project-reborn/components build-storybook` builds cleanly with every baseline component and every documented prop-driven state catalogued.
