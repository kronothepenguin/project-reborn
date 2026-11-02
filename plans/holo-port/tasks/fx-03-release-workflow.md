---
type: Task
title: Publish releases on tags
description: release.yml publishes archives for linux amd64 and aarch64 when a version tag is pushed.
status: done
phase: fx
depends_on: [fx-02]
packages: [.github/workflows]
holo: []
timestamp: 2026-11-02T01:45:42+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:45:42+00:00"}
---

# Goal

A tag like `v0.1.0` produces a GitHub release with prebuilt programs.

# Steps

- [x] `.github/workflows/release.yml`, on `v*`, running the gates first.
- [x] Build the frontends, then cross-compile `cms`, `housekeeping` and `installer` with `CGO_ENABLED=0`.
- [x] Publish `reborn-<tag>-linux-amd64.tar.gz`, `reborn-<tag>-linux-aarch64.tar.gz` and `SHA256SUMS`.
- [x] Run the packaging locally for both architectures, and start the amd64 programs from the archive.

# Verification

```sh
# the packaging steps locally for both architectures
```

Results (2026-11-02T01:45:42+00:00):

- `make release VERSION=v0.0.0` from a clean checkout built both archives, 17.5 MB for amd64 and 16.2 MB for aarch64, and
  `sha256sum -c SHA256SUMS` passed.
- The binaries are static, and each archive holds `cms`, `housekeeping` and `installer`.
- Unpacked in an empty folder, the amd64 installer served its forms and installed a hotel. Then `cms` answered 200 with the
  new site name, and `housekeeping` sent a guest to `site.url`.
- `release.yml` parses as YAML. GitHub runs it once the user pushes a tag.

# Notes

- The tag filter allows digits and dots only, so the version is safe to place in a shell command without an environment
  variable.
- The aarch64 binaries were built and listed, but not run, because no such machine is available here.
- Publishing uses `softprops/action-gh-release`, which takes its token by itself.
