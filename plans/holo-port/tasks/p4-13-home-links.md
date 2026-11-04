---
type: Task
title: Escape habbo names in home links
description: The home's Edit button, the editor's way back to the home and housekeeping's help queue link to the right home for a habbo whose name holds a question mark.
status: done
phase: p4
depends_on: []
packages: [packages/cms, packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T02:27:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:13:28+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:27:14+00:00"}
---

# Goal

A habbo's name may hold `?`, and three links put the name in an address as it is, so `Bob?x=1` reaches `/home/Bob`, the
home of another habbo. Each link escapes the name as a path segment, as the habbo search's redirect already does.

# Steps

- [x] The home's Edit button and the editor's way back to the home take the escaped name.
- [x] Housekeeping's help queue links to the escaped name's home.
- [x] Tests, and the `homes` browser suite opens the editor of a habbo whose name holds `?`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/housekeeping
cd tests/e2e && pnpm test homes housekeeping-users
```

Results (2026-11-04T02:27:14+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/housekeeping`.
- `pnpm test homes housekeeping-users` passes all 71 checks: `Who?me=1` reaches its home from My Page, its Edit button
  opens its editor at `/home/Who%3Fme=1/edit`, Cancel goes back to its home, and housekeeping's help queue opens that
  home. On binaries built before the fix, the Edit button led elsewhere and the suite failed waiting for the editor.
- The tests find the name escaped for an address on the home, the editor and a help queue row.
- Breaking these on purpose fails a test: the home's or the queue's name left unescaped.

# Notes

- `url.PathEscape` is what the habbo search's redirect already used, so every link to a home now reaches the same
  address.
