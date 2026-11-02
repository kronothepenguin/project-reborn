---
type: Task
title: Give housekeeping components their looks
description: Gold data lists, blue forms, a Log out link and the clock box, as decision 0060 says.
status: done
phase: fx
depends_on: []
packages: [packages/components, packages/housekeeping]
holo: []
timestamp: 2026-11-02T02:45:25+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:45:25+00:00"}
---

# Goal

Each housekeeping component has one look on every page, the one the screenshots show.

# Steps

- [x] Data lists get the `amber-300` header and `amber-100` rows, and forms get plain rows.
- [x] `Log out` on the top bar, with its route, ending the shared session.
- [x] The clock box, with local and server time.
- [x] Compare every page with `docs/hk.png` and the screenshots in a browser.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:45:25+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, 123 component tests and `svelte-check` pass, and the
  frontends build.
- `make e2e` passed all 382 checks, which read the computed colours of a data list, a form and the navigation, and watch the
  clock tick.
- The dashboard, the settings form and the group list were compared with `docs/hk.png` and the screenshots in a browser.
- A break made on purpose, `Log out` keeping the session, was caught.

# Notes

- `Log out` needs its own route, because housekeeping has no sign-in of its own. It ends the session the CMS shares, and the
  visitor lands on `site.url`.
- The server time is UTC, like every date the port stores. Go renders it, so it shows without JavaScript, and a script keeps it
  ticking and adds the local time.
