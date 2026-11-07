---
type: Task
title: Guard the club page's layout fields
description: The club page embeds the community layout but is missing from TestNoPageHidesAFieldOfTheLayout, so a field it gains with the name of a layout field would hide that field from the layout unnoticed.
status: done
phase: p6
depends_on: [p6-05]
packages: [packages/cms]
holo: []
timestamp: 2026-11-07T02:38:39+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:56:43+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:38:39+00:00"}
---

# Goal

The layout's guard covers every page that embeds `community`, the club page among them.

# Steps

- [x] `clubPage` joins the community pages of `TestNoPageHidesAFieldOfTheLayout` in
  `packages/cms/internal/router/pages_test.go`.
- [x] A field of `clubPage` named after a field of the layout, such as `Name`, fails the test.

# Verification

```sh
cd packages/cms && go test -race -run TestNoPageHidesAFieldOfTheLayout ./internal/router
```

Results (2026-11-07T02:38:39+00:00):

- The test passes with `clubPage` among the community pages, between `accountPage` and `communityPage`; `gofmt`
  lists nothing and `go vet` passes in `internal/router`.
- Breaking it on purpose fails it, 3 of 3: a field `Name`, `SignedIn` or `HousekeepingURL` in `clubPage` answers
  `clubPage hides community.Name`, and the others alike. With `clubPage` out of the list, as before, its field
  `Name` passes unnoticed.

# Notes

- Found by [p6-04](/tasks/p6-04-account-transactions.md) when it merged `main` after
  [p6-05](/tasks/p6-05-club-page.md): every other page that embeds `community` is listed there.
- Every other page of `internal/router` that embeds `community` or `hotelStatus`, directly or through another page,
  is in the test already; `newsPage` is only the part the two news pages share, and they are listed.
