---
type: Task
title: Build the housekeeping layout
description: The layout of docs/hk.png as a new design system, the Table primitive, the previous login and Holo's Access Denied page.
status: todo
phase: hk-a
depends_on: [hk-a-03]
packages: [packages/housekeeping, packages/components, packages/store]
holo: [source/holo/housekeeping/header.php, source/holo/housekeeping/subheader.php, source/holo/housekeeping/footer.php, source/holo/housekeeping/sitemenu.php, source/holo/housekeeping/usermenu.php, source/holo/housekeeping/access_denied.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Every housekeeping page shares the structure of `docs/hk.png`, in the design system of
[0041](/decisions/0041-housekeeping-design-system.md).

# Steps

- [ ] Measure `docs/hk.png`, map its colours with `tools/tw-color`, and add them to
  [the colours](/reference/colours.md#housekeeping).
- [ ] `src/layouts/housekeeping.astro`: the grey bar with who is logged in and their previous login, the tabs over the
  blue strip, the left column of boxes, the content and the footer.
- [ ] `GetPreviousLogin` in `packages/store`, with its documentation.
- [ ] `Table` in `packages/components`, with a story, a test, an export and a catalogue entry.
- [ ] The `chrome` every page embeds, and Holo's Access Denied page with 403 for staff missing an attribute.
- [ ] Remove the starter counter and page.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
pnpm --filter @project-reborn/housekeeping build
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then compare a screenshot with `docs/hk.png`.

# Notes

- None yet.
