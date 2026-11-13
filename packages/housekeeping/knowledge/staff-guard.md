---
type: Reference
title: The staff guard
description: How router.Staff and RequireAttribute decide who enters housekeeping and who opens each page.
---

# router.Staff

Every route, the static files too, runs behind `router.Staff`, because `/housekeeping/` also serves the built
templates.

- A guest goes to `site.url` to sign in, because a housekeeping running alone has no `/`.
- A banned user goes to `site.url`, where the CMS ends the session and shows the ban.
- A signed-in user without `housekeeping.access` gets a plain 403.

# RequireAttribute

`holding(attr, handler)` in `housekeeping.go` wraps a page in `RequireAttribute`. A staff member without the attribute
gets `access-denied.html` with 403, in the layout. `RequireAnyAttribute` lets in a holder of any one of several.

# Order of the wrappers

A page runs through `UpdateFailed`, `protect` (RealIP, cross-origin protection and the session), `Staff`, `Updating`
and its attribute, in that order (`Mount` in `housekeeping.go`). The update page, Log out and the static files skip
`Updating`, so they stay open while updates wait.
