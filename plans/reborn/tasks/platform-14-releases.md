---
type: Task
title: Releases ship reborn and the four separate programs
description: make release and the release workflow build reborn, cms, housekeeping, installer and server into each archive, and CI runs the reborn suite.
status: todo
slice: platform
depends_on: [platform-13]
packages: [Makefile, .github]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

An administrator downloads one archive and runs reborn alone or the separate programs
([0008](/decisions/0008-releases-ship-reborn-and-the-separate-programs.md)).

# Steps

- [ ] The root `Makefile`'s `release` builds `reborn`, `cms`, `housekeeping`, `installer` and `server` for linux amd64
  and aarch64, static, as today.
- [ ] `.github/workflows/release.yml` publishes them; `ci.yml` runs the reborn suite with the others.
- [ ] `make release VERSION=test` is run and the archive's contents listed here.

# Verification

```sh
make release VERSION=test && tar -tzf release/reborn-test-linux-amd64.tar.gz
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-14`. Nothing is pushed or tagged.
