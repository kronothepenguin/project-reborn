---
type: Task
title: Link the installer to the hotel
description: The installer's done page and its "already installed" page link to the hotel at site.url, so the administrator goes on to sign in.
status: done
phase: up
depends_on: []
packages: [packages/installer, tests/e2e]
holo: [source/holo/install.php]
timestamp: 2026-11-03T23:45:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:45:29+00:00"}
---

# Goal

After installing, the administrator goes from the installer to the hotel's index to sign in
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [x] The done page links to `site.url`, where the administrator signs in with the habbo name and password.
- [x] The "already installed" page links there too.
- [x] Tests for both pages, and the `together` browser suite follows the link to the CMS's index.

# Verification

```sh
cd packages/installer && gofmt -l . && go vet ./... && go test -race ./...
cd tests/e2e && pnpm test together
```

Results (2026-11-03T23:45:29+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/installer`.
- `pnpm test together` passes all 27 checks: the done page and the installed hotel's status page link to `site.url`, and
  the administrator reaches the CMS's index through the link and signs in there.
- The installation test finds the link on the done page and on the status page after installing, and none on the status
  page before.
- Breaking these on purpose fails a test: a done page or a status page linking elsewhere. A status page that reads
  `site.url` before the hotel is installed logs a warning, which the Go test misses and the `together` browser suite
  catches through its check of the server logs.
- The screenshot `installer-done` was read by eye.

# Notes

- The installer keeps refusing to install once an administrator exists, and it never applies updates.
