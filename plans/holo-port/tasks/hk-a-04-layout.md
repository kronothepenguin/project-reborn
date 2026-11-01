---
type: Task
title: Build the housekeeping layout
description: The layout of docs/hk.png as a new design system, the Table primitive, the previous login and Holo's Access Denied page.
status: done
phase: hk-a
depends_on: [hk-a-03]
packages: [packages/housekeeping, packages/components, packages/store]
holo: [source/holo/housekeeping/header.php, source/holo/housekeeping/subheader.php, source/holo/housekeeping/footer.php, source/holo/housekeeping/sitemenu.php, source/holo/housekeeping/usermenu.php, source/holo/housekeeping/access_denied.php]
timestamp: 2026-11-01T21:25:53+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:25:53+00:00"}
---

# Goal

Every housekeeping page shares the structure of `docs/hk.png`, in the design system of
[0041](/decisions/0041-housekeeping-design-system.md).

# Steps

- [x] Measure `docs/hk.png`, map its colours with `tools/tw-color`, and add them to
  [the colours](/reference/colours.md#housekeeping).
- [x] `src/layouts/housekeeping.astro`: the grey bar with who is logged in and their previous login, the tabs over the
  blue strip, the left column of boxes, the content and the footer.
- [x] `GetPreviousLogin` in `packages/store`, with its documentation.
- [x] `Table` in `packages/components`, with a story, a test, an export and a catalogue entry.
- [x] The `chrome` every page embeds, and Holo's Access Denied page with 403 for staff missing an attribute.
- [x] Remove the starter counter and page.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/housekeeping build
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then compare a screenshot with `docs/hk.png`.

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` (42 tests) and `packages/housekeeping` (12), `sqlc generate`
  changes nothing, `make check-docs` passes, 120 component tests and `svelte-check` pass, and the frontend builds.
- A hotel installed from a temporary `config.json`: signing in on the CMS opened housekeeping in a real Chromium on another
  port, with no console errors, and the screenshot, at the size of `docs/hk.png`, has its structure.

# Notes

- Svelte escapes a literal class at compile time, and `$.attributes()` escapes it again when the element takes a spread, so
  the `&` of `[&_td]:p-1` reached the browser as `&amp;amp;`, and the class matched nothing. A vitest browser test renders on
  the client and cannot see this, so the class lives in a script constant, as in `Button` and `Notice`, and
  [hk-a-09](/tasks/hk-a-09-exit-check.md) reads the computed style of a table on a served page.
- `[[ range ]]` and `[[ if ]]` survive inside `<tbody>` and `<select>`, through the Table and Select primitives.
- The primitive's test uses a fixture because `createRawSnippet` takes one root element.
