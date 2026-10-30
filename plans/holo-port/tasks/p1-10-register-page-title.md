---
type: Task
title: Give the register page a title
description: The register page was the only signed-out page with an empty title, found while reviewing the phase before closing it.
status: done
phase: p1
depends_on: [p1-04]
packages: [packages/cms]
holo: [source/holo/templates/login/register_subheader.php]
timestamp: 2026-10-30T22:42:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:39:40+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-30T22:42:24+00:00"}
---

# Goal

`/register` shows the site's short name and the page's name in its title, as Holo's does.

# Steps

- [x] `registerPage` carries `ShortName`, on both the page and the form that comes back with errors.
- [x] `register.astro` passes the title to the layout.
- [x] A test that both responses carry the name.

# Verification

```sh
pnpm --filter @project-reborn/cms build
grep -o '<title>[^<]*' packages/cms/dist/register.html
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-10-30T22:42:24+00:00):

- The CMS builds, and `dist/register.html`, `dist/disclaimer.html` and `dist/privacy.html` have titles such as
  `[[ .ShortName ]] ~ Register`.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, with a test that the page and the failed form both carry
  the short name.

# Notes

- Found while reviewing P1 before closing it, so it is a task of its own: [p1-09](/tasks/p1-09-exit-check.md) only verifies.
- Holo's titles use `~`, so the two legal pages changed from `:` as well.
