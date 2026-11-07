---
type: Task
title: Guard the club page's layout fields
description: The club page embeds the community layout but is missing from TestNoPageHidesAFieldOfTheLayout, so a field it gains with the name of a layout field would hide that field from the layout unnoticed.
status: todo
phase: p6
depends_on: [p6-05]
packages: [packages/cms]
holo: []
timestamp: 2026-11-07T00:56:43+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:56:43+00:00"}
---

# Goal

The layout's guard covers every page that embeds `community`, the club page among them.

# Steps

- [ ] `clubPage` joins the community pages of `TestNoPageHidesAFieldOfTheLayout` in
  `packages/cms/internal/router/pages_test.go`.
- [ ] A field of `clubPage` named after a field of the layout, such as `Name`, fails the test.

# Verification

```sh
cd packages/cms && go test -race -run TestNoPageHidesAFieldOfTheLayout ./internal/router
```

# Notes

- Found by [p6-04](/tasks/p6-04-account-transactions.md) when it merged `main` after
  [p6-05](/tasks/p6-05-club-page.md): every other page that embeds `community` is listed there.
