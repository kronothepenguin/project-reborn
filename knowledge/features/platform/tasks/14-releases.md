---
type: Task
title: Releases ship reborn and the four separate programs
description: make release and the release workflow build reborn, cms, housekeeping, installer and server into each archive, and CI runs the reborn suite.
scope: [Makefile, .github]
depends_on: [13-browser-suite]
skills: []
---

# Goal

An administrator downloads one archive and runs reborn alone or the separate programs
([0008](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Releases ship reborn and the four separate
  programs](/decisions/reborn/0008-releases-ship-reborn-and-the-separate-programs.md)
- Nothing is pushed or tagged.

# Steps

- [ ] The root `Makefile`'s `release` builds `reborn`, `cms`, `housekeeping`, `installer` and `server` for linux amd64
  and aarch64, static, as today.
- [ ] `.github/workflows/release.yml` publishes them; `ci.yml` runs the reborn suite with the others.
- [ ] `make release VERSION=test` is run and the archive's contents listed in the report.

# Checks

```sh
make release VERSION=test && tar -tzf release/reborn-test-linux-amd64.tar.gz
make gates
```
