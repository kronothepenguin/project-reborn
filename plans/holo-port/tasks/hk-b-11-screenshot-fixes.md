---
type: Task
title: Fix what the screenshots showed
description: The help ticket page named the asker as the one logged in, and the WHOIS link lost its space and was missing from the listing.
status: done
phase: hk-b
depends_on: [hk-b-01, hk-b-07]
packages: [packages/housekeeping, tests/e2e]
holo: [source/holo/housekeeping/users.php, source/holo/housekeeping/cloner.php]
timestamp: 2026-11-02T20:38:22+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:34:53+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T20:38:22+00:00"}
---

# Goal

Every housekeeping page names the staff member who is logged in, and the addresses read as in Holo.

# Steps

- [x] The ticket page keeps the asker in a field of its own, so the layout reads the staff member.
- [x] A test fails when a page's field hides one of the layout's.
- [x] `10.1.2.3 [WHOIS]`, with its space, on the habbo page.
- [x] The `WHOIS` link in the listing, as in `users.php` and `cloner.php`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
pnpm test housekeeping-access housekeeping-users
```

Results (2026-11-02T20:38:22+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`.
- `pnpm test housekeeping-access housekeeping-users` passes all 160 checks in a real browser, and the screenshots `help-ticket`
  and `user-listing` show `Logged in as: Admin-1` and `10.1.2.3 [WHOIS]`.
- A page's field that hides a layout's fails `TestNoPageHidesAFieldOfTheLayout`.

# Notes

- No test saw it, because the pages stand in for the layout in Go tests and no browser check read the header on that page.
  It showed in the screenshot `help-ticket`.
