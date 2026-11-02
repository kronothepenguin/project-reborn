---
type: Task
title: Publish releases on tags
description: release.yml publishes archives for linux amd64 and aarch64 when a version tag is pushed.
status: todo
phase: fx
depends_on: [fx-02]
packages: [.github/workflows]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A tag like `v0.1.0` produces a GitHub release with prebuilt programs.

# Steps

- [ ] `.github/workflows/release.yml`, on `v*`, running the gates first.
- [ ] Build the frontends, then cross-compile `cms`, `housekeeping` and `installer` with `CGO_ENABLED=0`.
- [ ] Publish `reborn-<tag>-linux-amd64.tar.gz`, `reborn-<tag>-linux-aarch64.tar.gz` and `SHA256SUMS`.
- [ ] Run the packaging locally for both architectures, and start the amd64 programs from the archive.

# Verification

```sh
# the packaging steps locally for both architectures
```

# Notes

- None yet.
