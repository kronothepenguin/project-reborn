---
type: Task
title: Give housekeeping components their looks
description: Gold data lists, blue forms, a Log out link and the clock box, as decision 0060 says.
status: todo
phase: fx
depends_on: []
packages: [packages/components, packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

Each housekeeping component has one look on every page, the one the screenshots show.

# Steps

- [ ] Data lists get the `amber-300` header and `amber-100` rows, and forms get plain rows.
- [ ] `Log out` on the top bar, with its route, ending the shared session.
- [ ] The clock box, with local and server time.
- [ ] Compare every page with `docs/hk.png` and the screenshots in a browser.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
