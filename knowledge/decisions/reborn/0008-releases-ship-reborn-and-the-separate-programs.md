---
type: Decision
title: Releases ship reborn and the four separate programs
description: Each release archive holds reborn and the standalone CMS, housekeeping, installer and game server, so that an administrator chooses one binary or several.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, releases]
---

# Decision

- Each release archive holds `reborn`, `cms`, `housekeeping`, `installer` and `server`.
- An administrator runs reborn alone, or the separate programs; both are supported.

# Context

The user: "i want to distribute single reborn binary with everything, but also distribute standalone cms, housekeeping,
installer and game server binaries. it is up to the admin decide what they want to run, single binary or many of them.
i want to have reborn orchestractor and cms, housekeeping, game server, installer standalone runners."

# Consequences

- Supersedes `knowledge/decisions/holo-port/0062-ci-and-releases.md`, whose archives held `cms`, `housekeeping` and
  `installer`. The rest of 0062 stands: `ci.yml` runs every gate and the browser suites, `release.yml` runs on a tag and
  publishes the linux amd64 and aarch64 archives with `SHA256SUMS`.
- `knowledge/features/platform/later.md`, "One binary", is corrected to name this decision.
- The separate programs are a way to run the hotel in production, so their remote API is secured as reborn's
  [0005](/decisions/reborn/0005-the-game-hears-live-changes-through-services.md) says.
