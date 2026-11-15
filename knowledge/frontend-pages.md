---
type: Playbook
title: Frontend pages
description: Where the pages, layouts, components and islands of the Astro frontends live, and the commands and checks that build them.
---

# Skills

| Work | Skill |
| --- | --- |
| A static `.astro` component or layout | `building-astro-components` |
| A page served by a Go handler, or Go data in a page | `templating-astro-pages` |
| A Svelte island | `adding-svelte-interactivity` |

# Frontends

`packages/cms`, `packages/housekeeping` and `packages/installer` each hold a Go module and its Astro frontend (Svelte
and Tailwind) side by side. Each frontend has:

| Path | Holds |
| --- | --- |
| `astro.config.mjs` | `build: { format: "file" }`, the Svelte and Tailwind integrations, and the dev server port. |
| `src/pages/` | One page per template name. |
| `src/layouts/` | `document.astro`, the document layout, and the body layouts. |
| `src/components/` | The app's own components and islands. |
| `src/styles/global.css` | The global styles, imported by `document.astro`. |
| `dist/` | The build output, embedded by `//go:embed dist/*` in `cms.go`, `housekeeping.go` and `installer.go`. |

- Body layouts: `signed-out.astro`, `community.astro` and `help-tool.astro` in the CMS; `housekeeping.astro` in
  housekeeping; `setup.astro` in the installer.
- The CMS and housekeeping group their components in one sub-folder per feature, such as
  `src/components/groups/`; the installer keeps them flat.
- Dev server ports: 22827 for the CMS, 22177 for housekeeping, 25050 for the installer.
- Housekeeping sets `base: "/housekeeping"`, so its pages mirror the route path after `/housekeeping`:
  `GET /housekeeping/settings` is `src/pages/settings.astro`.
- The `install` target of each package's `Makefile`, run by the root `make install`, writes a placeholder
  `dist/index.html`, so `go:embed` compiles before the first build.

# Pages and handlers

- Handlers live in `internal/router/`. Each writes a page with
  `astro.WriteTemplate(w, r.deps.Resolver, "<page>.html", page)`.
- The resolvers and `WriteTemplate` are in `packages/astro/knowledge/resolvers.md`.
- Page structs, layout fields and failed forms of the CMS are in `packages/cms/knowledge/pages.md`.
- Some pages are answers of other routes: `maintenance.astro` and `update-failed.astro`, which render the document
  layout directly, and `groups/not-found.astro`, `home/not-found.astro` and `home/banned.astro`.

# Components and islands

- Shared Svelte primitives come from `@project-reborn/components` (`packages/components`):
  `packages/components/knowledge/index.md`.
- Islands use `client:only="svelte"`. How the CMS islands read Go values: `packages/cms/knowledge/islands.md`.

# Commands

From the repo root:

```sh
pnpm --filter @project-reborn/cms build          # one frontend: cms, housekeeping or installer
make frontends                                   # the three frontends
make -C packages/components check                # component behaviour tests and svelte-check
make -C packages/cms check                       # one frontend's build, then its Go tests
make check                                       # every project's check and the knowledge check
```

The built page of a frontend is `packages/<app>/dist/<page>.html`.

# Checks

- `packages/cms/islands_test.go` (`TestEveryPageWakesItsIslandsForEveryone`) checks that every built CMS page with
  several islands wakes them for every visitor.
- `TestNoPageHidesAFieldOfTheLayout` in `packages/cms/internal/router/pages_test.go` checks that no page struct hides a
  field of its layout.
