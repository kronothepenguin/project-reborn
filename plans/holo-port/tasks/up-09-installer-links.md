---
type: Task
title: Link the installer to the hotel
description: The installer's done page and its "already installed" page link to the hotel at site.url, so the administrator goes on to sign in.
status: todo
phase: up
depends_on: []
packages: [packages/installer, tests/e2e]
holo: [source/holo/install.php]
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

After installing, the administrator goes from the installer to the hotel's index to sign in
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [ ] The done page links to `site.url`, where the administrator signs in with the habbo name and password.
- [ ] The "already installed" page links there too.
- [ ] Tests for both pages, and the `together` browser suite follows the link to the CMS's index.

# Verification

```sh
cd packages/installer && gofmt -l . && go vet ./... && go test -race ./...
cd tests/e2e && pnpm test together
```

# Notes

- The installer keeps refusing to install once an administrator exists, and it never applies updates.
