---
type: Decision
title: CI and releases on GitHub Actions
description: GitHub Actions runs every gate and the browser suites, and a version tag publishes prebuilt archives for linux amd64 and aarch64.
status: accepted
timestamp: 2026-11-02T01:24:38+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:24:38+00:00"}
tags: [process, ci]
---

# Decision

- `ci.yml` runs every gate and the browser suites on pushes to `main` and on pull requests.
- `release.yml` runs on a tag like `v0.1.0`, and publishes `reborn-<tag>-linux-amd64.tar.gz`,
  `reborn-<tag>-linux-aarch64.tar.gz` and `SHA256SUMS`.
- Each archive holds `cms`, `housekeeping` and `installer`.
- The browser suites move from a temporary folder into the repository.

# Context

The user answered: "i want to have github actions to build everything and create a prebuilt releases for linux amd64 and
aarch64.", then "yes" to releasing on tags and "yes" to moving the suites. The art is embedded, so no assets archive is
needed. With `CGO_ENABLED=0`, all three programs cross-compile to static binaries for both architectures, so one runner
is enough.

# Consequences

- Workflows run only once the user pushes, because the agent never pushes.
